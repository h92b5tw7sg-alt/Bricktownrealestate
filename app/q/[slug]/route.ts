import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site";

/**
 * Every sign's QR code points here (bricktownrealco.com/q/<slug>), not straight at the page.
 * That lets us count scans per sign and repoint a sign later without reprinting it.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: p } = await db().from("properties").select("id, slug").eq("slug", slug).maybeSingle();
  if (!p) return NextResponse.redirect(`${siteUrl()}/?from=sign`, 302);

  const ip = (req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "").trim();
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ADMIN_SESSION_SECRET || "bre";
  const visitor = ip ? createHash("sha256").update(`${salt}.${ip}.${day}`).digest("hex").slice(0, 24) : null;
  const ua = req.headers.get("user-agent")?.slice(0, 300) ?? null;
  // Skip link-preview bots so they don't inflate counts
  if (!/bot|crawl|spider|preview|facebookexternalhit|slackbot/i.test(ua ?? "")) {
    const { error } = await db().from("qr_scans").insert({ property_id: p.id, visitor, user_agent: ua });
    if (error) console.error("qr_scan", error.message);
  }
  return NextResponse.redirect(`${siteUrl()}/p/${p.slug}?src=qr`, 302);
}
