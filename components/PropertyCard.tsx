import Link from "next/link";
import { LISTING_LABEL, STATUS_LABEL, TYPE_LABEL, sizeLine, type Property } from "@/lib/types";

export default function PropertyCard({ p, cover, n }: { p: Property; cover?: string; n?: number }) {
  const size = sizeLine(p);
  return (
    <Link href={`/p/${p.slug}`} className="pcard">
      <div className="img">
        {cover ? <img src={cover} alt={`${p.address}`} loading="lazy" /> : <div className="placeholder">{p.address}</div>}
        <span className="tag">{LISTING_LABEL[p.listing_type]}</span>
        {p.status !== "available" && <span className="tag alt st">{STATUS_LABEL[p.status]}</span>}
        {n && p.status === "available" && <span className="pin-no" aria-label={`Map pin ${n}`}>{n}</span>}
      </div>
      <div className="body">
        <div className="eyebrow">{TYPE_LABEL[p.property_type]}{size ? ` · ${size}` : ""}</div>
        <div className="addr">{p.name !== p.address ? p.name : p.address}</div>
        <div className="meta">{p.name !== p.address ? `${p.address} · ` : ""}{p.city}, {p.state}</div>
        {p.headline && <div className="small">{p.headline}</div>}
        <div className="price">{p.price_display || "Call for pricing"} <span className="arrow" aria-hidden="true">→</span></div>
      </div>
    </Link>
  );
}
