import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import AdminNav from "../AdminNav";
import { saveSettings } from "../actions";

export const dynamic = "force-dynamic";

export default async function SiteSettings({ searchParams }: { searchParams: Promise<{ saved?: string; e?: string }> }) {
  await requireAdmin();
  const { saved, e } = await searchParams;
  const s = await getSettings();
  return (
    <div className="stack">
      <AdminNav />
      {saved && <div className="notice ok">Saved. The homepage updates within a minute.</div>}
      {e && <div className="notice bad">{e}</div>}
      <form action={saveSettings} className="card stack" encType="multipart/form-data">
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Homepage hero</h1>
        <p className="muted" style={{ margin: 0 }}>
          The big full-screen top of the homepage. A drone video plays muted on loop; the photo is used as the video&apos;s poster, or on its own with a slow zoom.
          With neither set, the first property rendering is used.
        </p>

        <div className="card" style={{ background: "#fff" }}>
          <h3>Background video</h3>
          {s.hero_video_url && <video src={s.hero_video_url} muted loop autoPlay playsInline style={{ width: "100%", maxWidth: 480, borderRadius: 10, marginBottom: 10 }} />}
          <div className="two">
            <div><label>Upload MP4 <span className="muted">(under 50 MB, 10–30 sec, 1080p)</span></label><input type="file" name="hero_video_url_file" accept="video/mp4,video/webm" /></div>
            <div><label>…or video file link</label><input name="hero_video_url" type="url" defaultValue={s.hero_video_url ?? ""} placeholder="https://…mp4" /></div>
          </div>
          {s.hero_video_url && <label className="check" style={{ marginTop: 10 }}><input type="checkbox" name="hero_video_url_clear" /> Remove video</label>}
        </div>

        <div className="card" style={{ background: "#fff" }}>
          <h3>Background photo</h3>
          {s.hero_image_url && <img src={s.hero_image_url} alt="" style={{ width: "100%", maxWidth: 480, borderRadius: 10, marginBottom: 10 }} />}
          <div className="two">
            <div><label>Upload photo <span className="muted">(wide, 2400px+)</span></label><input type="file" name="hero_image_url_file" accept="image/*" /></div>
            <div><label>…or image link</label><input name="hero_image_url" type="url" defaultValue={s.hero_image_url ?? ""} placeholder="https://…jpg" /></div>
          </div>
          {s.hero_image_url && <label className="check" style={{ marginTop: 10 }}><input type="checkbox" name="hero_image_url_clear" /> Remove photo</label>}
        </div>

        <div className="field"><label>Headline</label><input name="hero_headline" defaultValue={s.hero_headline ?? ""} placeholder="Space to build in Bricktown" /></div>
        <div className="field"><label>Subhead</label><textarea name="hero_subhead" rows={3} defaultValue={s.hero_subhead ?? ""} placeholder="Historic brick buildings, restaurant and nightlife space…" /></div>
        <div><button className="btn">Save homepage</button></div>
      </form>
    </div>
  );
}
