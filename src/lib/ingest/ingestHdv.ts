import { fetchHDV, HdvEntry } from "../ng/hdvClient";
import { supabase } from "../../lib/supabaseClient";
import crypto from "crypto";
import { roundTo15Min, quantiles, stddev, mean } from "./statsUtils";

export function getListingKey(entry: HdvEntry) {
  const str = [entry.pseudo, entry.itemName, entry.price, entry.expiry, entry.superexpiry, entry.quantity].join("|");
  return crypto.createHash("sha256").update(str).digest("hex");
}

export async function ingestHdv() {
  const now = new Date();
  const fetched_at = now.toISOString();
  const hdv = await fetchHDV();

  // Upsert items
  const itemKeys = [...new Set(hdv.map(e => e.itemName))];
  const { data: items } = await supabase
    .from("items")
    .upsert(itemKeys.map(item_key => ({ item_key })), { onConflict: "item_key" })
    .select();

  const itemMap = new Map(items.map((it: any) => [it.item_key, it.id]));

  // Insert listings_snapshot
  const rows = hdv.map(e => ({
    id: crypto.randomUUID(),
    fetched_at,
    item_id: itemMap.get(e.itemName),
    pseudo: e.pseudo,
    price: e.price,
    quantity: e.quantity,
    sold: e.sold,
    expiry: new Date(e.expiry * 1000).toISOString(),
    superexpiry: new Date(e.superexpiry * 1000).toISOString(),
    listing_key: getListingKey(e),
  }));
  await supabase.from("listings_snapshot").insert(rows);

  // Calcul stats
  const stats = await computeStats(fetched_at, itemMap);
  for (const s of stats) {
    await supabase.from("item_stats").upsert(s, { onConflict: ["item_id", "bucket_at"] });
  }
  return { ok: true, ingested_at: fetched_at, items_count: itemKeys.length };
}

// --- Stat helpers ---

async function computeStats(fetched_at: string, itemMap: Map<string, string>) {
  // Récupère tous les items
  const stats: any[] = [];
  for (const [item_key, item_id] of itemMap.entries()) {
    // 1. Listings actifs du snapshot courant
    const { data: listings } = await supabase
      .from("listings_snapshot")
      .select("*")
      .eq("item_id", item_id)
      .eq("fetched_at", fetched_at);
    if (!listings || listings.length === 0) continue;
    const now = new Date(fetched_at);
    const actives = listings.filter(l => l.sold < l.quantity && now < new Date(l.superexpiry));
    const prices = actives.map(l => l.price);
    const quantities = actives.map(l => l.quantity - l.sold);
    const active_listings = actives.length;
    const active_quantity = quantities.reduce((a, b) => a + b, 0);
    // 2. Quantiles et stats prix
    const [p10, p50, p90] = quantiles(prices, [0.1, 0.5, 0.9]);
    const meanPrice = mean(prices);
    // 3. sold_delta (par listing_key)
    let sold_delta = 0;
    if (listings.length > 0) {
      // Récupère snapshot précédent
      const { data: prev } = await supabase
        .from("listings_snapshot")
        .select("listing_key,sold")
        .eq("item_id", item_id)
        .lt("fetched_at", fetched_at)
        .order("fetched_at", { ascending: false })
        .limit(1000);
      if (prev) {
        const prevMap = new Map(prev.map((l: any) => [l.listing_key, l.sold]));
        for (const l of listings) {
          const prevSold = prevMap.get(l.listing_key) ?? 0;
          sold_delta += Math.max(0, l.sold - prevSold);
        }
      }
    }
    // 4. trend_24h et volatility_7d
    let trend_24h = null, volatility_7d = null;
    {
      // Récupère p50 sur 7j
      const { data: hist } = await supabase
        .from("item_stats")
        .select("bucket_at,p50")
        .eq("item_id", item_id)
        .gte("bucket_at", new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString())
        .order("bucket_at");
      if (hist && hist.length > 0) {
        const p50s = hist.map((h: any) => h.p50).filter((v: any) => v != null);
        const mean7d = mean(p50s);
        volatility_7d = mean7d ? stddev(p50s) / mean7d : null;
        // trend_24h
        const p50_24h_ago = hist.find((h: any) => Math.abs(new Date(h.bucket_at).getTime() - (now.getTime() - 24*60*60*1000)) < 8*60*60*1000)?.p50;
        if (p50_24h_ago && p50) trend_24h = (p50 - p50_24h_ago) / p50_24h_ago;
      }
    }
    // 5. deal_score (simplifié)
    let deal_score = 0;
    if (p50 && p10 && meanPrice) {
      // Ecart vs médiane
      const median7d = p50; // approximation faute de p50_7d
      const ecart = median7d ? (p10 - median7d) / median7d : 0;
      // Rareté/volume
      const spread = p90 && p10 ? (p90 - p10) : 0;
      const rarete = (active_quantity < 10 ? -0.2 : 0) + (spread > 0.5 * (p50 ?? 1) ? -0.2 : 0);
      // Tendance
      const tendance = trend_24h ?? 0;
      // Age annonce (non pris en compte ici)
      deal_score = Math.round(50 + 30 * -ecart + 10 * tendance + 10 * rarete);
      deal_score = Math.max(0, Math.min(100, deal_score));
    }
    // 6. recommended_buy/sell
    let recommended_buy = p10 ? Math.floor(p10 / 10) * 10 : null;
    let recommended_sell = p90 ? Math.ceil(p90 / 10) * 10 : null;
    // 7. risk_level
    let risk_level: 'low'|'medium'|'high' = 'medium';
    if (volatility_7d != null) {
      if (volatility_7d < 0.1) risk_level = 'low';
      else if (volatility_7d > 0.3) risk_level = 'high';
    }
    // 8. bucket_at arrondi 15min
    const bucket_at = roundTo15Min(now);
    stats.push({
      item_id,
      bucket_at,
      p10, p50, p90,
      mean: meanPrice,
      active_listings,
      active_quantity,
      sold_delta,
      trend_24h,
      volatility_7d,
      deal_score,
      risk_level,
      recommended_buy,
      recommended_sell
    });
  }
  return stats;
}
