import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { qrPng, qrSvg } from "@/lib/qr";

/** Print-ready QR files for the sign shop: ?format=svg (vector, any size) or png (3000px). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new NextResponse("Not found", { status: 404 });
  const { id } = await params;
  const { data: p } = await db().from("properties").select("slug").eq("id", id).maybeSingle();
  if (!p) return new NextResponse("Not found", { status: 404 });
  const format = req.nextUrl.searchParams.get("format") === "png" ? "png" : "svg";
  const name = `qr-${p.slug}.${format}`;
  const headers = { "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "no-store" };
  if (format === "png") return new NextResponse(new Uint8Array(await qrPng(p.slug)), { headers: { ...headers, "Content-Type": "image/png" } });
  return new NextResponse(await qrSvg(p.slug, "#000000"), { headers: { ...headers, "Content-Type": "image/svg+xml" } });
}
