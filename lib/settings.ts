import { db } from "./db";

export type SiteSettings = {
  hero_video_url?: string;
  hero_image_url?: string;
  hero_headline?: string;
  hero_subhead?: string;
};

export async function getSettings(): Promise<SiteSettings> {
  const { data, error } = await db().from("site_settings").select("key, value");
  if (error) return {};
  return Object.fromEntries((data ?? []).filter((r) => r.value).map((r) => [r.key, r.value])) as SiteSettings;
}
