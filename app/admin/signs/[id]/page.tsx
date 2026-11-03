import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { qrSvg, signUrl } from "@/lib/qr";
import { LISTING_LABEL, type Property } from "@/lib/types";
import Sign from "@/components/Sign";
import AdminNav from "../../AdminNav";
import PrintButton from "../PrintButton";

export const dynamic = "force-dynamic";

const BANDS = ["For Lease", "For Sale", "For Sale or Lease", "Available", "Coming Soon", "Build to Suit"];

export default async function SignPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ band?: string; layout?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const { data } = await db().from("properties").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as Property;
  const band = sp.band && BANDS.includes(sp.band) ? sp.band : LISTING_LABEL[p.listing_type];
  const portrait = sp.layout === "portrait";
  const svg = await qrSvg(p.slug);
  const q = (o: Record<string, string>) => `?${new URLSearchParams({ band, layout: portrait ? "portrait" : "landscape", ...o })}`;

  return (
    <div>
      <div className="no-print stack" style={{ marginBottom: 18 }}><AdminNav /></div>
      <div className="sign-tools card stack">
        <div className="row between">
          <div><Link href="/admin/signs" className="small">← All signs</Link><h1 style={{ fontSize: "1.8rem", marginTop: 4 }}>Sign · {p.address}</h1></div>
          <PrintButton />
        </div>
        <div className="row"><b className="small">Headline:</b>{BANDS.map((b) => <Link key={b} className={`btn sm ${b === band ? "dark" : "ghost"}`} href={q({ band: b })}>{b}</Link>)}</div>
        <div className="row"><b className="small">Layout:</b>
          <Link className={`btn sm ${!portrait ? "dark" : "ghost"}`} href={q({ layout: "landscape" })}>Landscape (48×36, 24×18 yard sign, 8×4 banner)</Link>
          <Link className={`btn sm ${portrait ? "dark" : "ghost"}`} href={q({ layout: "portrait" })}>Portrait (window / 18×24)</Link>
        </div>
        <div className="row"><b className="small">QR for the sign shop:</b>
          <a className="btn sm" href={`/admin/qr/${p.id}?format=svg`}>Download SVG (vector)</a>
          <a className="btn sm ghost" href={`/admin/qr/${p.id}?format=png`}>Download PNG (3000px)</a>
          <span className="small muted">Encodes <span style={{ fontFamily: "monospace" }}>{signUrl(p.slug)}</span></span>
        </div>
        {!p.published && <div className="notice bad">This listing is a draft. Publish it before the sign goes up, or scans will land on a “not listed” page.</div>}
      </div>
      <Sign p={p} svg={svg} band={band} portrait={portrait} />
      <p className="small muted no-print" style={{ textAlign: "center", marginTop: 12 }}>
        Print to PDF (set paper size to your sign size, margins none, background graphics on) and send to the sign shop. Keep the QR at least 8&quot; wide for scanning from a sidewalk, 12&quot;+ from across the street.
      </p>
    </div>
  );
}
