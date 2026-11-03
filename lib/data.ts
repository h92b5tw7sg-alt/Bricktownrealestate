import { db } from "./db";
import type { Media, Property } from "./types";

export async function publishedProperties(): Promise<Property[]> {
  const { data, error } = await db().from("properties").select("*").eq("published", true).order("sort").order("address");
  if (error) throw error;
  return (data ?? []) as Property[];
}

export async function propertyBySlug(slug: string, includeUnpublished = false) {
  let q = db().from("properties").select("*").eq("slug", slug);
  if (!includeUnpublished) q = q.eq("published", true);
  const { data } = await q.maybeSingle();
  return (data as Property) ?? null;
}

export async function mediaFor(propertyId: string): Promise<Media[]> {
  const { data } = await db().from("property_media").select("*").eq("property_id", propertyId).order("sort").order("created_at");
  return (data ?? []) as Media[];
}

/** First rendering, else first photo, else the hero URL. */
export async function coverImages(ids: string[]) {
  const out = new Map<string, string>();
  if (!ids.length) return out;
  const { data } = await db().from("property_media").select("property_id, kind, url, sort")
    .in("property_id", ids).in("kind", ["rendering", "photo"]).order("sort");
  for (const kind of ["rendering", "photo"]) {
    for (const m of (data ?? []) as Media[]) if (m.kind === kind && !out.has(m.property_id)) out.set(m.property_id, m.url);
  }
  return out;
}
