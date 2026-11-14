import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import InquiryForm from "@/components/InquiryForm";
import CompareSlider from "@/components/CompareSlider";
import DistrictMap from "@/components/DistrictMap";
import TrackView from "@/components/TrackView";
import { mediaFor, propertyBySlug } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { contact, siteUrl, telHref } from "@/lib/site";
import { LISTING_LABEL, STATUS_LABEL, TYPE_LABEL, embedUrl, fullAddress, mapsUrl, sizeLine, type Media } from "@/lib/types";

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
  const tours = by("tour");
  const before = by("before")[0];
  const rendering = by("rendering")[0];
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.name !== p.address ? `${p.name} — ${p.address}` : p.address,
    description: p.headline || p.description || undefined,
    url: `${siteUrl()}/p/${p.slug}`,
    image: images.map((m) => m.url).slice(0, 10),
    offers: { "@type": "Offer", businessFunction: p.listing_type === "sale" ? "http://purl.org/goodrelations/v1#Sell" : "http://purl.org/goodrelations/v1#LeaseOut", availability: p.status === "available" ? "https://schema.org/InStock" : "https://schema.org/SoldOut" },
    about: {
      "@type": p.property_type === "land" || p.property_type === "parking" ? "Place" : "LocalBusiness",
      name: p.address,
      address: { "@type": "PostalAddress", streetAddress: p.address, addressLocality: p.city, addressRegion: p.state, postalCode: p.zip || undefined, addressCountry: "US" },
      ...(p.lat && p.lng ? { geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng } } : {}),
      ...(p.sqft ? { floorSize: { "@type": "QuantitativeValue", value: Number(p.sqft), unitCode: "FTK" } } : {}),
    },
  };

  return (
    <div className="stack">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <TrackView id={p.id} />
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

      {before && rendering && (
        <section data-reveal>
          <div className="eyebrow">Before &amp; after</div>
          <h2>Today vs. the vision</h2>
          <p className="muted">Drag the handle to compare.</p>
          <CompareSlider before={before.url} after={rendering.url} beforeLabel={before.caption || "Today"} afterLabel={rendering.caption || "Rendering"} />
        </section>
      )}

      {(p.headline || p.description || p.highlights.length > 0) && (
        <section className="card" data-reveal>
          {p.headline && <h2>{p.headline}</h2>}
          {p.description && p.description.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
          {p.highlights.length > 0 && <ul className="highlights">{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>}
        </section>
      )}

      {tours.map((v) => {
        const e = embedUrl(v.url);
        return e ? (
          <section key={v.id} data-reveal>
            <div className="eyebrow">Walk through it</div>
            <h2>{v.caption || "3D tour"}</h2>
            <iframe className="tour" src={e} title={v.caption || "3D tour"} allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer" allowFullScreen loading="lazy" />
          </section>
        ) : null;
      })}

      {plans.length > 0 && (
        <section data-reveal>
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
        const e = embedUrl(v.url);
        return e ? <iframe key={v.id} className="video" src={e} title={v.caption || "Property video"} allowFullScreen loading="lazy" data-reveal /> : null;
      })}

      {docs.length > 0 && (
        <section className="docs" data-reveal>
          <h2>Brochures &amp; documents</h2>
          {docs.map((d) => <a key={d.id} href={d.url} target="_blank" rel="noopener">↓ {d.caption || "Download brochure"}</a>)}
        </section>
      )}

      {p.lat && p.lng && (
        <section data-reveal>
          <div className="eyebrow">Location</div>
          <h2>{fullAddress(p)}</h2>
          <DistrictMap pins={[{ id: p.id, lat: p.lat, lng: p.lng, label: "★", title: p.name !== p.address ? p.name : p.address, sub: sizeLine(p) }]} height={360} zoom={17} />
          <p className="small"><a href={mapsUrl(p)} target="_blank" rel="noopener">Open in Google Maps →</a></p>
        </section>
      )}

      <section className="card" style={{ maxWidth: 720 }} data-reveal>
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
