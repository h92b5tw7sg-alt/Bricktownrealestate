import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { coverImages, publishedProperties } from "@/lib/data";
import { contact, telHref } from "@/lib/site";

export const revalidate = 60;

const FILTERS = [
  { key: "", label: "All" },
  { key: "lease", label: "For Lease" },
  { key: "sale", label: "For Sale" },
  { key: "land", label: "Land & Lots" },
];

export default async function Home({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f = "" } = await searchParams;
  const all = await publishedProperties();
  const list = all.filter((p) => {
    if (f === "lease") return p.listing_type !== "sale";
    if (f === "sale") return p.listing_type !== "lease";
    if (f === "land") return p.property_type === "land" || p.property_type === "parking";
    return true;
  });
  const covers = await coverImages(list.map((p) => p.id));
  const totalSf = all.reduce((s, p) => s + (Number(p.sqft) || 0), 0);
  const c = contact();

  return (
    <>
      <section className="hero">
        <div className="eyebrow">Bricktown · Oklahoma City</div>
        <h1>Space to build in Bricktown</h1>
        <p>Historic brick buildings, restaurant and nightlife space, and development sites in OKC&apos;s entertainment district — available for lease or sale, direct from the owner.</p>
        <div className="row" style={{ marginTop: 18 }}>
          <a className="btn" href="#listings">View properties</a>
          <a className="btn ghost" style={{ color: "#fff", borderColor: "#fff" }} href={telHref(c.phone)}>Call {c.phone}</a>
        </div>
        <div className="hero-stats">
          <div><b>{all.length}</b><span>Available</span></div>
          {totalSf > 0 && <div><b>{Math.round(totalSf).toLocaleString()}</b><span>Square feet</span></div>}
          <div><b>Direct</b><span>From the owner</span></div>
        </div>
      </section>

      <nav className="filters" aria-label="Filter properties" id="listings">
        {FILTERS.map((x) => (
          <Link key={x.key} href={x.key ? `/?f=${x.key}#listings` : "/#listings"} aria-current={f === x.key ? "page" : undefined}>{x.label}</Link>
        ))}
      </nav>

      {list.length ? (
        <div className="grid">{list.map((p) => <PropertyCard key={p.id} p={p} cover={covers.get(p.id)} />)}</div>
      ) : (
        <div className="card">
          <h3>Nothing listed in this category right now</h3>
          <p className="muted">New space opens up regularly. Call {c.phone} to hear about properties before they&apos;re listed.</p>
        </div>
      )}
    </>
  );
}
