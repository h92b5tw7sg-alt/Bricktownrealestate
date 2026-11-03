import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { LISTING_LABEL, STATUS_LABEL, sizeLine, type Property } from "@/lib/types";
import AdminNav from "./AdminNav";
import { createProperty, togglePublish } from "./actions";

export const dynamic = "force-dynamic";

type Stat = { property_id: string; scans: number; scans_7d: number; unique_visitors: number; inquiries: number };

export default async function AdminHome() {
  await requireAdmin();
  const [{ data: props }, { data: stats }, { count: openInq }, { data: media }] = await Promise.all([
    db().from("properties").select("*").order("sort").order("address"),
    db().rpc("property_stats"),
    db().from("inquiries").select("id", { count: "exact", head: true }).eq("handled", false),
    db().from("property_media").select("property_id, kind"),
  ]);
  const st = new Map(((stats ?? []) as Stat[]).map((x) => [x.property_id, x]));
  const mc = new Map<string, Record<string, number>>();
  for (const m of (media ?? []) as { property_id: string; kind: string }[]) {
    const r = mc.get(m.property_id) ?? {}; r[m.kind] = (r[m.kind] ?? 0) + 1; mc.set(m.property_id, r);
  }
  const list = (props ?? []) as Property[];
  const tot = [...st.values()].reduce((a, x) => ({ s: a.s + Number(x.scans), w: a.w + Number(x.scans_7d), i: a.i + Number(x.inquiries) }), { s: 0, w: 0, i: 0 });

  return (
    <div className="stack">
      <AdminNav />
      <h1 className="sr-only">Properties</h1>
      <div className="stats">
        <div className="card stat"><div className="n">{list.filter((p) => p.published).length}<span className="muted" style={{ fontSize: "1.1rem" }}>/{list.length}</span></div><div className="l">Live listings</div></div>
        <div className="card stat"><div className="n">{tot.s.toLocaleString()}</div><div className="l">QR scans (all time)</div></div>
        <div className="card stat"><div className="n">{tot.w.toLocaleString()}</div><div className="l">Scans last 7 days</div></div>
        <div className="card stat"><div className="n">{tot.i.toLocaleString()}</div><div className="l">Inquiries</div></div>
        <Link href="/admin/inquiries" className="card stat" style={{ textDecoration: "none", color: "inherit" }}><div className="n" style={{ color: "var(--brick)" }}>{openInq ?? 0}</div><div className="l">Need follow-up →</div></Link>
      </div>

      <div className="card table-wrap">
        <div className="row between"><h2 style={{ margin: 0 }}>Properties</h2>
          <form action={createProperty} className="row">
            <input name="address" placeholder="New property address" required style={{ width: 240 }} />
            <button className="btn sm">+ Add</button>
          </form>
        </div>
        <table style={{ marginTop: 12 }}>
          <thead><tr><th>Property</th><th>Offering</th><th>Size</th><th>Media</th><th>Scans</th><th>Inq.</th><th>Live</th><th></th></tr></thead>
          <tbody>
            {list.map((p) => {
              const x = st.get(p.id); const m = mc.get(p.id) ?? {};
              return (
                <tr key={p.id}>
                  <td><Link href={`/admin/p/${p.id}`} style={{ fontWeight: 800 }}>{p.address}</Link>
                    <div className="small muted">{p.name !== p.address ? p.name + " · " : ""}{p.prop_code ?? ""}</div></td>
                  <td>{LISTING_LABEL[p.listing_type]}<div className="small muted">{STATUS_LABEL[p.status]}</div></td>
                  <td className="small">{sizeLine(p) || "—"}</td>
                  <td className="small">{(m.rendering ?? 0)} rend · {(m.photo ?? 0)} photo · {(m.floor_plan ?? 0)} plan</td>
                  <td>{Number(x?.scans ?? 0)}<div className="small muted">{Number(x?.scans_7d ?? 0)} this wk</div></td>
                  <td>{Number(x?.inquiries ?? 0)}</td>
                  <td>
                    <form action={togglePublish}>
                      <input type="hidden" name="id" value={p.id} /><input type="hidden" name="published" value={p.published ? "0" : "1"} />
                      <button className={`btn sm ${p.published ? "" : "ghost"}`}>{p.published ? "Live" : "Draft"}</button>
                    </form>
                  </td>
                  <td className="small" style={{ whiteSpace: "nowrap" }}><Link href={`/p/${p.slug}`} target="_blank">View</Link> · <Link href={`/admin/signs/${p.id}`}>Sign</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
