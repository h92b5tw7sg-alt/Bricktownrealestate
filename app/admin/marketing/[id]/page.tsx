import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { mediaFor } from "@/lib/data";
import { PLATFORMS } from "@/lib/platforms";
import { listingDescription, listingTitle, socialPost, trackedUrl } from "@/lib/listing-copy";
import { fullAddress, sizeLine, type Property } from "@/lib/types";
import AdminNav from "../../AdminNav";
import CopyBox from "@/components/CopyBox";

export const dynamic = "force-dynamic";

export default async function ListingKit({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { data } = await db().from("properties").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as Property;
  const media = await mediaFor(p.id);
  const imgs = media.filter((m) => ["rendering", "photo", "before"].includes(m.kind));
  const plans = media.filter((m) => m.kind === "floor_plan");
  const tours = media.filter((m) => m.kind === "tour");

  return (
    <div className="stack">
      <AdminNav />
      <div><Link href="/admin/marketing" className="small">← Marketing</Link><h1 style={{ fontSize: "2rem", marginTop: 4 }}>Listing kit · {p.address}</h1>
        <p className="muted" style={{ margin: 0 }}>Copy these into each platform. Every link is tagged so you can see which site sends leads.</p></div>

      <section className="card">
        <h2>The basics</h2>
        <CopyBox label="Listing title" text={listingTitle(p)} rows={1} />
        <CopyBox label="Address" text={fullAddress(p)} rows={1} />
        <div className="two">
          <CopyBox label="Size" text={sizeLine(p) || "—"} rows={1} />
          <CopyBox label="Price / rate" text={p.price_display || "Call for pricing"} rows={1} />
        </div>
        {tours[0] && <CopyBox label="3D tour link (paste in the platform's virtual-tour field)" text={tours[0].url} rows={1} />}
      </section>

      <section className="card">
        <h2>Photos, renderings &amp; floor plans</h2>
        {imgs.length + plans.length === 0 ? (
          <p className="muted">No media yet — <Link href={`/admin/p/${p.id}#media`}>upload renderings and floor plans</Link> first. Listings with photos get far more views.</p>
        ) : (
          <>
            <p className="small muted" style={{ marginTop: 0 }}>Right-click → Save image, or open each and drag into the platform&apos;s upload box. Renderings first.</p>
            <div className="media-grid">
              {[...imgs, ...plans].map((m) => (
                <a key={m.id} className="media-item" href={m.url} target="_blank" rel="noopener" download>
                  <div className="thumb">{/\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(m.url) ? <img src={m.url} alt="" /> : <span>PDF</span>}</div>
                  <div className="cap"><span>{m.caption || m.kind}</span><span>↓</span></div>
                </a>
              ))}
            </div>
          </>
        )}
      </section>

      {PLATFORMS.filter((pl) => !(pl.leaseOnly && p.listing_type === "sale") && pl.key !== "google").map((pl) => (
        <section key={pl.key} className="card">
          <div className="row between">
            <h2 style={{ margin: 0 }}>{pl.name} <span className="tag soft" style={{ verticalAlign: "middle" }}>{pl.cost}</span></h2>
            {pl.addUrl && <a className="btn sm" href={pl.addUrl} target="_blank" rel="noopener">Open {pl.name} ↗</a>}
          </div>
          <p className="small muted">{pl.note}</p>
          {["facebook", "linkedin"].includes(pl.key)
            ? <CopyBox label="Post" text={socialPost(p, pl.key)} rows={8} />
            : <CopyBox label="Description" text={listingDescription(p, pl.key, media)} rows={10} />}
          <CopyBox label="Tracked link back to your site" text={trackedUrl(p, pl.key)} rows={1} />
        </section>
      ))}
    </div>
  );
}
