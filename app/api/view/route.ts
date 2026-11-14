import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { cleanSource } from "@/lib/platforms";

/** Counts a property page view by traffic source (utm_source / qr / referrer). */
export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (/bot|crawl|spider|preview/i.test(ua)) return new NextResponse(null, { status: 204 });
    const { id, source } = await req.json();
    if (typeof id !== "string" || !/^[0-9a-f-]{36}$/.test(id)) return new NextResponse(null, { status: 204 });
    await db().from("page_views").insert({ property_id: id, source: cleanSource(source) });
  } catch { /* never break the page */ }
  return new NextResponse(null, { status: 204 });
}
