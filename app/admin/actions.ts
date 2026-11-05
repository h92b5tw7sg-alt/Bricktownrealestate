"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { endSession, requireAdmin } from "@/lib/auth";

const BUCKET = "property-media";
const s = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const n = (v: FormDataEntryValue | null) => { const t = s(v).replace(/[,\s]/g, ""); return t === "" || isNaN(Number(t)) ? null : Number(t); };
const KINDS = ["photo", "rendering", "floor_plan", "brochure", "video", "before", "tour"];
const slugify = (t: string) => t.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

function refresh(slug?: string) {
  revalidatePath("/");
  if (slug) revalidatePath(`/p/${slug}`);
  revalidatePath("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function createProperty(form: FormData) {
  await requireAdmin();
  const address = s(form.get("address"));
  if (!address) redirect("/admin?e=address");
  let slug = slugify(address);
  const { data: clash } = await db().from("properties").select("id").eq("slug", slug).maybeSingle();
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  const { data, error } = await db().from("properties").insert({ address, name: address, slug }).select("id").single();
  if (error) throw error;
  refresh();
  redirect(`/admin/p/${data.id}`);
}

export async function saveProperty(form: FormData) {
  await requireAdmin();
  const id = s(form.get("id"));
  const newSlug = slugify(s(form.get("slug")) || s(form.get("address")));
  const row = {
    name: s(form.get("name")) || s(form.get("address")),
    address: s(form.get("address")),
    city: s(form.get("city")) || "Oklahoma City",
    state: s(form.get("state")) || "OK",
    zip: s(form.get("zip")) || null,
    slug: newSlug,
    property_type: s(form.get("property_type")) || "building",
    listing_type: s(form.get("listing_type")) || "sale_or_lease",
    status: s(form.get("status")) || "available",
    published: form.get("published") === "on",
    sqft: n(form.get("sqft")),
    acreage: n(form.get("acreage")),
    floors: n(form.get("floors")),
    year_built: n(form.get("year_built")),
    zoning: s(form.get("zoning")) || null,
    price_display: s(form.get("price_display")) || null,
    headline: s(form.get("headline")) || null,
    description: s(form.get("description")) || null,
    highlights: s(form.get("highlights")).split("\n").map((x) => x.trim()).filter(Boolean),
    sort: n(form.get("sort")) ?? 100,
    lat: n(form.get("lat")),
    lng: n(form.get("lng")),
  };
  const { error } = await db().from("properties").update(row).eq("id", id);
  if (error) redirect(`/admin/p/${id}?e=${encodeURIComponent(error.code === "23505" ? "That web address (slug) is already used." : error.message)}`);
  refresh(newSlug);
  redirect(`/admin/p/${id}?saved=1`);
}

export async function togglePublish(form: FormData) {
  await requireAdmin();
  const id = s(form.get("id"));
  const pub = form.get("published") === "1";
  const { data } = await db().from("properties").update({ published: pub }).eq("id", id).select("slug").single();
  refresh(data?.slug);
}

export async function deleteProperty(form: FormData) {
  await requireAdmin();
  const id = s(form.get("id"));
  if (s(form.get("confirm")) !== "DELETE") redirect(`/admin/p/${id}?e=${encodeURIComponent("Type DELETE to confirm.")}`);
  const { data: media } = await db().from("property_media").select("storage_path").eq("property_id", id);
  const paths = (media ?? []).map((m) => m.storage_path).filter(Boolean) as string[];
  if (paths.length) await db().storage.from(BUCKET).remove(paths);
  await db().from("properties").delete().eq("id", id);
  refresh();
  redirect("/admin");
}

export async function uploadMedia(form: FormData) {
  await requireAdmin();
  const id = s(form.get("id"));
  const kind = KINDS.includes(s(form.get("kind"))) ? s(form.get("kind")) : "photo";
  const caption = s(form.get("caption")) || null;
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const link = s(form.get("link"));
  const { data: prop } = await db().from("properties").select("slug").eq("id", id).single();
  const { count } = await db().from("property_media").select("id", { count: "exact", head: true }).eq("property_id", id);
  let sort = (count ?? 0) * 10;

  for (const f of files) {
    const ext = (f.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${prop?.slug ?? id}/${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const { error } = await db().storage.from(BUCKET).upload(path, Buffer.from(await f.arrayBuffer()), { contentType: f.type || undefined, upsert: false });
    if (error) redirect(`/admin/p/${id}?e=${encodeURIComponent("Upload failed: " + error.message)}`);
    const url = db().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    await db().from("property_media").insert({ property_id: id, kind, url, storage_path: path, caption: caption ?? f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), sort: (sort += 10) });
  }
  if (link) await db().from("property_media").insert({ property_id: id, kind, url: link, caption, sort: (sort += 10) });
  refresh(prop?.slug);
  redirect(`/admin/p/${id}?saved=1#media`);
}

export async function updateMedia(form: FormData) {
  await requireAdmin();
  const id = s(form.get("media_id"));
  const pid = s(form.get("id"));
  const op = s(form.get("op"));
  const { data: m } = await db().from("property_media").select("*").eq("id", id).single();
  if (!m) redirect(`/admin/p/${pid}#media`);
  if (op === "delete") {
    if (m.storage_path) await db().storage.from(BUCKET).remove([m.storage_path]);
    await db().from("property_media").delete().eq("id", id);
  } else if (op === "first") {
    await db().from("property_media").update({ sort: -Date.now() % 100000 }).eq("id", id);
  } else if (op === "caption") {
    await db().from("property_media").update({ caption: s(form.get("caption")) || null }).eq("id", id);
  }
  const { data: prop } = await db().from("properties").select("slug").eq("id", pid).single();
  refresh(prop?.slug);
  redirect(`/admin/p/${pid}#media`);
}

export async function markInquiry(form: FormData) {
  await requireAdmin();
  await db().from("inquiries").update({ handled: form.get("handled") === "1" }).eq("id", s(form.get("id")));
  revalidatePath("/admin/inquiries");
}

const SETTING_KEYS = ["hero_video_url", "hero_image_url", "hero_headline", "hero_subhead"];

export async function saveSettings(form: FormData) {
  await requireAdmin();
  const rows: { key: string; value: string | null; updated_at: string }[] = [];
  for (const key of ["hero_headline", "hero_subhead"]) rows.push({ key, value: s(form.get(key)) || null, updated_at: new Date().toISOString() });
  for (const key of ["hero_video_url", "hero_image_url"]) {
    const file = form.get(`${key}_file`);
    const link = s(form.get(key));
    let value: string | null = link || null;
    if (file instanceof File && file.size > 0) {
      const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `_site/${key}-${Date.now()}.${ext}`;
      const { error } = await db().storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type || undefined });
      if (error) redirect(`/admin/site?e=${encodeURIComponent("Upload failed: " + error.message)}`);
      value = db().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }
    if (form.get(`${key}_clear`) === "on") value = null;
    rows.push({ key, value, updated_at: new Date().toISOString() });
  }
  const { error } = await db().from("site_settings").upsert(rows.filter((r) => SETTING_KEYS.includes(r.key)));
  if (error) redirect(`/admin/site?e=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  redirect("/admin/site?saved=1");
}
