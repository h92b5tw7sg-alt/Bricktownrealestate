import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import Hero from "@/components/Hero";
import DistrictMap, { type Pin } from "@/components/DistrictMap";
import { coverImages, publishedProperties } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { contact } from "@/lib/site";
import { LISTING_LABEL, sizeLine } from "@/lib/types";

export const revalidate = 60;

const FILTERS = [
  { key: "", label: "All" },
  { key: "lease", label: "For Lease" },
  { key: "sale", label: "For Sale" },
  { key: "land", label: "Land & Lots" },
];

export default async function Home({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f = "" } = await searchParams;
  const [all, settings] = await Promise.all([publishedProperties(), getSettings()]);
  const list = all.filter((p) => {
    if (f === "lease") return p.listing_type !== "sale";
    if (f === "sale") return p.listing_type !== "lease";
    if (f === "land") return p.property_type === "land" || p.property_type === "parking";
    return true;
  });
  const covers = await coverImages(all.map((p) => p.id));
  const totalSf = all.reduce((s, p) => s + (Number(p.sqft) || 0), 0);
  const c = contact();
  const heroImage = settings.hero_image_url || [...covers.values()][0];

  const pins: Pin[] = all.filter((p) => p.lat && p.lng).map((p, i) => ({
    id: p.id, lat: p.lat!, lng: p.lng!, label: String(i + 1),
    title: p.name !== p.address ? p.name : p.address,
    sub: [LISTING_LABEL[p.listing_type], sizeLine(p)].filter(Boolean).join(" · "),
    href: `/p/${p.slug}`, image: covers.get(p.id),
  }));

  return (
    <>
      <Hero
        video={settings.hero_video_url}
        image={heroImage}
        headline={settings.hero_headline || "Space to build in Bricktown"}
        subhead={settings.hero_subhead || "Historic brick buildings, restaurant and nightlife space, and development sites in OKC's entertainment district — available for lease or sale, direct from the owner."}
        phone={c.phone}
        credit={settings.hero_image_url ? settings.hero_credit : undefined}
        creditUrl={settings.hero_credit_url}
        stats={[
          { n: String(all.length), l: "Available" },
          ...(totalSf > 0 ? [{ n: Math.round(totalSf).toLocaleString(), l: "Square feet" }] : []),
          { n: "Direct", l: "From the owner" },
        ]}
      />

      <nav className="filters" aria-label="Filter properties" id="listings" data-reveal>
        {FILTERS.map((x) => (
          <Link key={x.key} href={x.key ? `/?f=${x.key}#listings` : "/#listings"} aria-current={f === x.key ? "page" : undefined}>{x.label}</Link>
        ))}
      </nav>

      {list.length ? (
        <div className="grid">{list.map((p) => <div key={p.id} data-reveal><PropertyCard p={p} cover={covers.get(p.id)} n={pins.findIndex((x) => x.id === p.id) + 1 || undefined} /></div>)}</div>
      ) : (
        <div className="card" data-reveal>
          <h3>Nothing listed in this category right now</h3>
          <p className="muted">New space opens up regularly. Call {c.phone} to hear about properties before they&apos;re listed.</p>
        </div>
      )}

      {pins.length > 0 && (
        <section id="map" className="map-section" data-reveal>
          <div className="section-head">
            <div className="eyebrow">The district</div>
            <h2>Find it in Bricktown</h2>
            <p className="muted">Steps from the ballpark, the canal, Paycom Center and Scissortail Park. Tap a pin for details.</p>
          </div>
          <DistrictMap pins={pins} height={520} />
        </section>
      )}

      <section className="why" data-reveal>
        {[
          ["Foot traffic", "Ballgames, concerts, Thunder nights and canal crowds bring people past your door year-round."],
          ["Character", "Turn-of-the-century brick, timber and loft ceilings you can't build new."],
          ["Owner direct", "No middleman. Talk to the owner and get answers on terms, buildout and timing fast."],
        ].map(([t, d]) => <div key={t} className="card"><h3>{t}</h3><p className="muted" style={{ margin: 0 }}>{d}</p></div>)}
      </section>
    </>
  );
}
