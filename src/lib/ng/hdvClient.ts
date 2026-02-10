import { z } from "zod";

export const HdvEntrySchema = z.object({
  pseudo: z.string(),
  quantity: z.number(),
  expiry: z.number(),
  sold: z.number(),
  price: z.number(),
  superexpiry: z.number(),
  itemName: z.string(),
});
export type HdvEntry = z.infer<typeof HdvEntrySchema>;

export async function fetchHDV(server = "mocha", token = process.env.NG_API_TOKEN): Promise<HdvEntry[]> {
  const url = `https://publicapi.nationsglory.fr/hdv/${server}/list`;
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(url, {
        headers: { Authorization: token ?? "" },
        signal: ctrl.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return z.array(HdvEntrySchema).parse(data);
    } catch (e) {
      lastError = e;
      console.error(`[fetchHDV] Attempt ${attempt + 1} failed:`, e);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw lastError;
}
