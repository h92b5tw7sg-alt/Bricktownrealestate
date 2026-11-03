import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AdminNav from "../AdminNav";
import { markInquiry } from "../actions";

export const dynamic = "force-dynamic";

type Row = { id: string; name: string; email: string | null; phone: string | null; company: string | null; interest: string; message: string | null; source: string; handled: boolean; created_at: string; properties: { address: string; slug: string } | null };

export default async function Inquiries() {
  await requireAdmin();
  const { data } = await db().from("inquiries").select("*, properties(address, slug)").order("created_at", { ascending: false }).limit(500);
  const rows = (data ?? []) as Row[];
  const fmt = (d: string) => new Date(d).toLocaleString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div className="stack">
      <AdminNav />
      <div className="card table-wrap">
        <h1 style={{ fontSize: "2rem" }}>Inquiries</h1>
        {!rows.length && <p className="muted">None yet. They show up here the moment someone submits the form on a property page.</p>}
        {rows.length > 0 && (
          <table>
            <thead><tr><th>When</th><th>Property</th><th>Who</th><th>Wants</th><th>Message</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ opacity: r.handled ? .55 : 1 }}>
                  <td className="small" style={{ whiteSpace: "nowrap" }}>{fmt(r.created_at)}{r.source === "qr" && <div><span className="tag soft">Sign scan</span></div>}</td>
                  <td>{r.properties ? <Link href={`/p/${r.properties.slug}`} target="_blank">{r.properties.address}</Link> : "—"}</td>
                  <td><b>{r.name}</b>{r.company && <div className="small">{r.company}</div>}
                    {r.phone && <div className="small"><a href={`tel:${r.phone}`}>{r.phone}</a></div>}
                    {r.email && <div className="small"><a href={`mailto:${r.email}`}>{r.email}</a></div>}</td>
                  <td className="small" style={{ textTransform: "capitalize" }}>{r.interest}</td>
                  <td className="small" style={{ maxWidth: 360, whiteSpace: "pre-wrap" }}>{r.message}</td>
                  <td><form action={markInquiry}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="handled" value={r.handled ? "0" : "1"} />
                    <button className="btn sm ghost">{r.handled ? "Reopen" : "Done"}</button></form></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
