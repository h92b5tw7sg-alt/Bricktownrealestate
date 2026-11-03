import type { MetadataRoute } from "next";
import { publishedProperties } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const props = await publishedProperties().catch(() => []);
  return [{ url: base, changeFrequency: "weekly", priority: 1 }, ...props.map((p) => ({ url: `${base}/p/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 }))];
}
