import { db } from "@/lib/db";
import type { Media, Property } from "@/lib/types";

export async function feedData() {
  const { data: props } = await db().from("properties").select("*").eq("published", true).order("sort");
  const list = (props ?? []) as Property[];
  const { data: media } = list.length
    ? await db().from("property_media").select("*").in("property_id", list.map((p) => p.id)).order("sort")
    : { data: [] };
  const byProp = new Map<string, Media[]>();
  for (const m of (media ?? []) as Media[]) byProp.set(m.property_id, [...(byProp.get(m.property_id) ?? []), m]);
  return list.map((p) => ({ p, media: byProp.get(p.id) ?? [] }));
}
