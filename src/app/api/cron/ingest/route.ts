import { NextRequest, NextResponse } from "next/server";
import { ingestHdv } from "@/lib/ingest/ingestHdv";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const result = await ingestHdv();
  return NextResponse.json(result);
}
