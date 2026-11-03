import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { qrSvg, signUrl } from "@/lib/qr";
import { LISTING_LABEL, type Property } from "@/lib/types";
import Sign from "@/components/Sign";
import AdminNav from "../AdminNav";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function Signs({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  await requireAdmin();
  const { all } = await searchParams;
  let q = db().from("properties").select("*").order("sort").order("address");
  if (!all) q = q.eq("published", true);
  const { data } = await q;
  const list = (data ?? []) as Property[];
  const svgs = await Promise.all(list.map((p) => qrSvg(p.slug)));

  return (
    <div>
      <div className="no-print stack" style={{ marginBottom: 18 }}><AdminNav /></div>
      <div className="sign-tools card stack">
        <div className="row between">
          <h1 style={{ fontSize: "2rem", margin: 0 }}>Signs &amp; QR codes</h1>
          <PrintButton label="Print all signs" />
        </div>
        <p className="small muted" style={{ margin: 0 }}>
          Each QR points to bricktownrealco.com/q/&lt;property&gt;, which counts the scan and opens the property page. Showing {all ? "all" : "live"} properties —{" "}
          <Link href={all ? "/admin/signs" : "/admin/signs?all=1"}>{all ? "live only" : "include drafts"}</Link>.
        </p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Property</th><th>Headline</th><th>QR link</th><th></th></tr></thead>
            <tbody>{list.map((p) => (
              <tr key={p.id}>
                <td><b>{p.address}</b>{!p.published && <> <span className="tag warn">Draft</span></>}</td>
                <td className="small">{LISTING_LABEL[p.listing_type]}</td>
                <td className="small" style={{ fontFamily: "monospace" }}>{signUrl(p.slug).replace(/^https?:\/\//, "")}</td>
                <td className="small" style={{ whiteSpace: "nowrap" }}>
                  <Link href={`/admin/signs/${p.id}`}>Customize</Link> · <a href={`/admin/qr/${p.id}?format=svg`}>SVG</a> · <a href={`/admin/qr/${p.id}?format=png`}>PNG</a>
                </td>
              </tr>))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="stack">{list.map((p, i) => <Sign key={p.id} p={p} svg={svgs[i]} band={LISTING_LABEL[p.listing_type]} />)}</div>
    </div>
  );
}
