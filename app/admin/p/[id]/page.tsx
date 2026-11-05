import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { mediaFor } from "@/lib/data";
import { KIND_LABEL, LISTING_LABEL, STATUS_LABEL, TYPE_LABEL, type MediaKind, type Property } from "@/lib/types";
import AdminNav from "../../AdminNav";
import { deleteProperty, saveProperty, updateMedia, uploadMedia } from "../../actions";
import PinPicker from "./PinPicker";

export const dynamic = "force-dynamic";

const KINDS: MediaKind[] = ["rendering", "before", "photo", "floor_plan", "tour", "brochure", "video"];
const isImg = (u: string) => /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(u);

export default async function EditProperty({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; e?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { saved, e } = await searchParams;
  const { data } = await db().from("properties").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as Property;
  const media = await mediaFor(p.id);

  return (
    <div className="stack">
      <AdminNav />
      <div className="row between">
        <div><Link href="/admin" className="small">← All properties</Link><h1 style={{ fontSize: "2.2rem", marginTop: 4 }}>{p.address}</h1></div>
        <div className="row">
          <Link className="btn ghost sm" href={`/p/${p.slug}`} target="_blank">Preview page ↗</Link>
          <Link className="btn dark sm" href={`/admin/signs/${p.id}`}>Sign &amp; QR</Link>
        </div>
      </div>
      {saved && <div className="notice ok">Saved.</div>}
      {e && <div className="notice bad">{e}</div>}

      <form action={saveProperty} className="card">
        <input type="hidden" name="id" value={p.id} />
        <div className="row between"><h2 style={{ margin: 0 }}>Listing details</h2>
          <label className="check"><input type="checkbox" name="published" defaultChecked={p.published} /> Live on website</label></div>
        <div className="field two" style={{ marginTop: 14 }}>
          <div><label>Street address</label><input name="address" defaultValue={p.address} required /></div>
          <div><label>Display name <span className="muted">(e.g. building name)</span></label><input name="name" defaultValue={p.name} /></div>
        </div>
        <div className="field three">
          <div><label>City</label><input name="city" defaultValue={p.city} /></div>
          <div><label>State</label><input name="state" defaultValue={p.state} /></div>
          <div><label>ZIP</label><input name="zip" defaultValue={p.zip ?? ""} /></div>
        </div>
        <div className="field three">
          <div><label>Offering</label><select name="listing_type" defaultValue={p.listing_type}>{Object.entries(LISTING_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label>Status</label><select name="status" defaultValue={p.status}>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label>Type</label><select name="property_type" defaultValue={p.property_type}>{Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        </div>
        <div className="field three">
          <div><label>Square feet</label><input name="sqft" inputMode="numeric" defaultValue={p.sqft ?? ""} /></div>
          <div><label>Acres</label><input name="acreage" inputMode="decimal" defaultValue={p.acreage ?? ""} /></div>
          <div><label>Floors</label><input name="floors" inputMode="numeric" defaultValue={p.floors ?? ""} /></div>
        </div>
        <div className="field three">
          <div><label>Year built</label><input name="year_built" inputMode="numeric" defaultValue={p.year_built ?? ""} /></div>
          <div><label>Zoning</label><input name="zoning" defaultValue={p.zoning ?? ""} /></div>
          <div><label>Price / rate shown</label><input name="price_display" placeholder="Call for pricing" defaultValue={p.price_display ?? ""} /></div>
        </div>
        <div className="field"><label>Headline</label><input name="headline" placeholder="Corner restaurant space on the canal" defaultValue={p.headline ?? ""} /></div>
        <div className="field"><label>Description <span className="muted">(blank line = new paragraph)</span></label><textarea name="description" rows={6} defaultValue={p.description ?? ""} /></div>
        <div className="field"><label>Highlights <span className="muted">(one per line)</span></label><textarea name="highlights" rows={5} defaultValue={p.highlights.join("\n")} /></div>
        <div className="field two">
          <div><label>Web address</label><input name="slug" defaultValue={p.slug} /><div className="small muted">bricktownrealco.com/p/{p.slug} — changing this breaks QR codes already printed.</div></div>
          <div><label>Sort order <span className="muted">(lower = first)</span></label><input name="sort" inputMode="numeric" defaultValue={p.sort} /></div>
        </div>
        <div className="field"><label>Map pin</label><PinPicker lat={p.lat} lng={p.lng} /></div>
        <button className="btn" style={{ marginTop: 16 }}>Save</button>
      </form>

      <section className="card" id="media">
        <h2>Renderings, photos &amp; floor plans</h2>
        <form action={uploadMedia} className="row" style={{ alignItems: "end" }} encType="multipart/form-data">
          <input type="hidden" name="id" value={p.id} />
          <div style={{ flex: "1 1 150px" }}><label>Type</label><select name="kind" defaultValue="rendering">{KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}</select></div>
          <div style={{ flex: "2 1 220px" }}><label>Files <span className="muted">(images or PDF, many at once)</span></label><input type="file" name="files" multiple accept="image/*,application/pdf" /></div>
          <div style={{ flex: "2 1 200px" }}><label>…or link <span className="muted">(Matterport, Kuula, YouTube)</span></label><input name="link" type="url" placeholder="https://" /></div>
          <div style={{ flex: "2 1 180px" }}><label>Caption</label><input name="caption" placeholder="Level 2 — open plan" /></div>
          <button className="btn">Upload</button>
        </form>

        {KINDS.map((k) => {
          const items = media.filter((m) => m.kind === k);
          if (!items.length) return null;
          return (
            <div key={k} style={{ marginTop: 20 }}>
              <h3>{KIND_LABEL[k]} ({items.length})</h3>
              <div className="media-grid">
                {items.map((m, i) => (
                  <div key={m.id} className="media-item">
                    <a className="thumb" href={m.url} target="_blank" rel="noopener">{isImg(m.url) ? <img src={m.url} alt="" /> : <span>{m.url.toLowerCase().includes(".pdf") ? "PDF" : "LINK"}</span>}</a>
                    <form action={updateMedia} className="cap">
                      <input type="hidden" name="id" value={p.id} /><input type="hidden" name="media_id" value={m.id} />
                      <input name="caption" defaultValue={m.caption ?? ""} style={{ padding: "4px 6px", fontSize: ".8rem" }} aria-label="Caption" />
                      <button name="op" value="caption" className="btn sm ghost" title="Save caption">✓</button>
                    </form>
                    <form action={updateMedia} className="cap">
                      <input type="hidden" name="id" value={p.id} /><input type="hidden" name="media_id" value={m.id} />
                      {i > 0 ? <button name="op" value="first" className="btn sm ghost">Make first</button> : <span className="tag soft">Cover</span>}
                      <button name="op" value="delete" className="btn sm danger">Delete</button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <p className="small muted" style={{ marginTop: 10 }}>
          <b>Renderings</b> show first and on the listing card. Add a <b>Today</b> photo from the same angle as the first rendering to turn on the drag-to-compare slider.
          <b> 3D / 360 Tours</b>: paste a Matterport, Kuula or CloudPano share link.
        </p>
        {!media.length && <p className="muted" style={{ marginTop: 14 }}>No media yet.</p>}
      </section>

      <form action={deleteProperty} className="card no-print">
        <input type="hidden" name="id" value={p.id} />
        <h3>Delete property</h3>
        <p className="small muted">Removes the listing and its uploaded files. Printed QR codes will land on the homepage instead.</p>
        <div className="row"><input name="confirm" placeholder="Type DELETE" style={{ width: 180 }} /><button className="btn danger sm">Delete</button></div>
      </form>
    </div>
  );
}
