import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import InquiryForm from "@/components/InquiryForm";
import { mediaFor, propertyBySlug } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { contact, siteUrl, telHref } from "@/lib/site";
import { LISTING_LABEL, STATUS_LABEL, TYPE_LABEL, fullAddress, mapsUrl, type Media } from "@/lib/types";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ src?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await propertyBySlug(slug);
  if (!p) return { title: "Property" };
  const media = await mediaFor(p.id);
  const img = media.find((m) => m.kind === "rendering" || m.kind === "photo")?.url;
  const title = `${p.address} — ${LISTING_LABEL[p.listing_type]}`;
  return {
    title,
    description: p.headline || `${TYPE_LABEL[p.property_type]} ${LISTING_LABEL[p.listing_type].toLowerCase()} in Bricktown, Oklahoma City.`,
    alternates: { canonical: `${siteUrl()}/p/${p.slug}` },
    openGraph: { title, images: img ? [img] : undefined },
  };
}

function youtubeEmbed(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  const v = url.match(/vimeo\.com\/(\d+)/);
  if (v) return `https://player.vimeo.com/video/${v[1]}`;
  return null;
}

export default async function PropertyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { src } = await searchParams;
  const admin = await isAdmin();
  const p = await propertyBySlug(slug, admin);
  if (!p) notFound();
  const media = await mediaFor(p.id);
  const by = (k: Media["kind"]) => media.filter((m) => m.kind === k);
  const images = [...by("rendering"), ...by("photo")];
  const plans = by("floor_plan");
  const docs = by("brochure");
  const videos = by("video");
  const c = contact();
  const fromSign = src === "qr";
  const label = p.name !== p.address ? `${p.name} — ${p.address}` : p.address;

  const facts: [string, string][] = [];
  facts.push(["Offering", LISTING_LABEL[p.listing_type]]);
  facts.push(["Status", STATUS_LABEL[p.status]]);
  if (p.sqft) facts.push(["Building / Space", `${Number(p.sqft).toLocaleString()} SF`]);
  if (p.acreage) facts.push(["Land", `${Number(p.acreage).toLocaleString(undefined, { maximumFractionDigits: 3 })} acres`]);
  if (p.floors) facts.push(["Floors", String(p.floors)]);
  if (p.year_built) facts.push(["Built", String(p.year_built)]);
  if (p.zoning) facts.push(["Zoning", p.zoning]);
  facts.push(["Type", TYPE_LABEL[p.property_type]]);

  return (
    <div className="stack">
      {!p.published && <div className="notice bad no-print">Draft — only you can see this page. Publish it in the admin.</div>}
      {fromSign && <div className="welcome">Thanks for scanning the sign. Renderings, floor plans and details are below — or call {c.phone} now.</div>}

      <div className="prop-head">
        <div>
          <Gallery images={images.map((m) => ({ url: m.url, caption: m.caption, kind: m.kind }))} fallback={p.address} />
        </div>
        <aside className="side card">
          <div className="row" style={{ gap: 6 }}>
            <span className="tag">{LISTING_LABEL[p.listing_type]}</span>
            {p.status !== "available" && <span className="tag alt">{STATUS_LABEL[p.status]}</span>}
          </div>
          <h1 style={{ marginTop: 12, fontSize: "clamp(2rem, 5vw, 2.8rem)" }}>{p.name !== p.address ? p.name : p.address}</h1>
          <div className="muted">{fullAddress(p)} · <a href={mapsUrl(p)} target="_blank" rel="noopener">Map</a></div>
          <div style={{ fontWeight: 800, fontSize: "1.25rem", marginTop: 10 }}>{p.price_display || "Call for pricing"}</div>
          <dl className="facts">{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          <div className="row">
            <a className="btn" style={{ flex: 1 }} href={telHref(c.phone)}>Call {c.phone}</a>
            <a className="btn ghost" style={{ flex: 1 }} href="#inquire">Inquire</a>
          </div>
          <div className="small muted" style={{ marginTop: 10 }}>{c.name} · Bricktown Real Estate</div>
        </aside>
      </div>

      {(p.headline || p.description || p.highlights.length > 0) && (
        <section className="card">
          {p.headline && <h2>{p.headline}</h2>}
          {p.description && p.description.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
          {p.highlights.length > 0 && <ul className="highlights">{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>}
        </section>
      )}

      {plans.length > 0 && (
        <section>
          <h2>Floor plans</h2>
          <div className="plans">
            {plans.map((m) => (
              <figure key={m.id}>
                {m.url.toLowerCase().endsWith(".pdf")
                  ? <a href={m.url} target="_blank" rel="noopener" style={{ display: "block", padding: 24, fontWeight: 700 }}>Open floor plan (PDF)</a>
                  : <a href={m.url} target="_blank" rel="noopener"><img src={m.url} alt={m.caption || "Floor plan"} loading="lazy" /></a>}
                {m.caption && <figcaption>{m.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {videos.map((v) => {
        const e = youtubeEmbed(v.url);
        return e ? <iframe key={v.id} className="video" src={e} title={v.caption || "Property video"} allowFullScreen /> : null;
      })}

      {docs.length > 0 && (
        <section className="docs">
          <h2>Brochures &amp; documents</h2>
          {docs.map((d) => <a key={d.id} href={d.url} target="_blank" rel="noopener">↓ {d.caption || "Download brochure"}</a>)}
        </section>
      )}

      <section className="card" style={{ maxWidth: 720 }}>
        <h2>Get details or schedule a tour</h2>
        <p className="muted">Tell us a little about your plans and we&apos;ll follow up — usually same day.</p>
        <InquiryForm propertyId={p.id} label={label} source={fromSign ? "qr" : "web"} defaultInterest={p.listing_type === "sale" ? "buy" : p.listing_type === "lease" ? "lease" : "info"} />
      </section>

      <div className="callbar no-print">
        <a className="btn" href={telHref(c.phone)}>Call now</a>
        <a className="btn ghost" style={{ color: "#fff", borderColor: "#fff" }} href="#inquire">Inquire</a>
      </div>
    </div>
  );
}
