import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { siteUrl } from "@/lib/site";
import { PLATFORMS, STATUS_OPTS } from "@/lib/platforms";
import type { Property } from "@/lib/types";
import AdminNav from "../AdminNav";
import { setSyndication } from "../actions";
import CopyBox from "@/components/CopyBox";

export const dynamic = "force-dynamic";

type Syn = { property_id: string; platform: string; status: string; url: string | null };

export default async function Marketing() {
  await requireAdmin();
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const [{ data: props }, { data: syn }, { data: views }, { data: inq }] = await Promise.all([
    db().from("properties").select("*").eq("published", true).order("sort"),
    db().from("syndication").select("*"),
    db().from("page_views").select("source").gte("viewed_at", since).limit(20000),
    db().from("inquiries").select("utm_source, source").gte("created_at", since),
  ]);
  const list = (props ?? []) as Property[];
  const s = new Map(((syn ?? []) as Syn[]).map((r) => [`${r.property_id}:${r.platform}`, r]));
  const bySrc = new Map<string, { v: number; i: number }>();
  for (const r of (views ?? []) as { source: string }[]) { const x = bySrc.get(r.source) ?? { v: 0, i: 0 }; x.v++; bySrc.set(r.source, x); }
  for (const r of (inq ?? []) as { utm_source: string | null; source: string }[]) { const k = r.utm_source || (r.source === "qr" ? "qr" : "direct"); const x = bySrc.get(k) ?? { v: 0, i: 0 }; x.i++; bySrc.set(k, x); }
  const srcRows = [...bySrc.entries()].sort((a, b) => b[1].v - a[1].v);
  const base = siteUrl();

  return (
    <div className="stack">
      <AdminNav />
      <h1 style={{ fontSize: "2rem", margin: 0 }}>Marketing &amp; syndication</h1>

      <section className="card">
        <h2>Lead sources · last 30 days</h2>
        {srcRows.length ? (
          <table><thead><tr><th>Source</th><th>Page views</th><th>Inquiries</th></tr></thead>
            <tbody>{srcRows.map(([k, v]) => <tr key={k}><td style={{ textTransform: "capitalize" }}>{PLATFORMS.find((p) => p.key === k)?.name ?? (k === "qr" ? "Sign QR scans" : k)}</td><td>{v.v}</td><td>{v.i}</td></tr>)}</tbody></table>
        ) : <p className="muted">No traffic yet. Every link in the listing kits is tagged, so each platform shows up here once people click through.</p>}
      </section>

      <section className="card">
        <h2>Automatic feed</h2>
        <p className="muted" style={{ marginTop: 0 }}>Always-current list of your live properties with photos, floor plans and tours. Give the XML link to CommercialCafe (&ldquo;Send Us Your Feed&rdquo;) or any broker/platform that takes a feed; use the CSV for bulk-upload or email.</p>
        <CopyBox label="XML feed" text={`${base}/feeds/listings.xml`} rows={1} />
        <CopyBox label="CSV feed" text={`${base}/feeds/listings.csv`} rows={1} />
      </section>

      <section className="card table-wrap">
        <h2>Where each property is listed</h2>
        <table>
          <thead><tr><th>Property</th>{PLATFORMS.map((p) => <th key={p.key} title={p.note}>{p.name}<div className="small" style={{ textTransform: "none", letterSpacing: 0 }}>{p.cost}</div></th>)}</tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/admin/marketing/${p.id}`} style={{ fontWeight: 800 }}>{p.address}</Link><div className="small"><Link href={`/admin/marketing/${p.id}`}>Listing kit →</Link></div></td>
                {PLATFORMS.map((pl) => {
                  const r = s.get(`${p.id}:${pl.key}`);
                  const st = r?.status ?? (pl.leaseOnly && p.listing_type === "sale" ? "na" : "todo");
                  return (
                    <td key={pl.key}>
                      <form action={setSyndication} className="stack" style={{ gap: 4 }}>
                        <input type="hidden" name="property_id" value={p.id} /><input type="hidden" name="platform" value={pl.key} />
                        <select name="status" defaultValue={st} style={{ padding: "4px 6px", fontSize: ".8rem" }}>{STATUS_OPTS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
                        <input name="url" defaultValue={r?.url ?? ""} placeholder="Listing URL" style={{ padding: "4px 6px", fontSize: ".75rem", marginTop: 4 }} />
                        <button className="btn sm ghost" style={{ marginTop: 4 }}>Save</button>
                        {r?.url && <a href={r.url} target="_blank" rel="noopener" className="small">View ↗</a>}
                      </form>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
