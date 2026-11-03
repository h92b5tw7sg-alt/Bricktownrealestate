import { BRAND, DOMAIN, contact } from "@/lib/site";
import { sizeLine, type Property } from "@/lib/types";

export default function Sign({ p, svg, band, portrait }: { p: Property; svg: string; band: string; portrait?: boolean }) {
  const c = contact();
  const size = sizeLine(p);
  return (
    <div className={`sign${portrait ? " portrait" : ""}`}>
      <div className="band">{band}</div>
      <div className="mid">
        <div>
          <div className="addr">{p.name !== p.address ? p.name : p.address}</div>
          {p.name !== p.address && <div className="size" style={{ marginTop: 4 }}>{p.address}</div>}
          {size && <div className="size">{size}</div>}
          {p.headline && <div className="size" style={{ color: "var(--ink)", fontWeight: 700 }}>{p.headline}</div>}
        </div>
        <div className="qr">
          <div dangerouslySetInnerHTML={{ __html: svg }} />
          <div className="scan">Scan for renderings &amp; floor plans</div>
        </div>
      </div>
      <div className="foot">
        <div><div className="phone">{c.phone}</div><div className="who">{c.name} · {BRAND}</div></div>
        <div className="web">{DOMAIN}</div>
      </div>
    </div>
  );
}
