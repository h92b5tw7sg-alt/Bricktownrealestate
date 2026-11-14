import { feedData } from "../shared";
import { contact } from "@/lib/site";
import { LISTING_LABEL, TYPE_LABEL } from "@/lib/types";
import { listingDescription, listingTitle, trackedUrl } from "@/lib/listing-copy";

export const revalidate = 300;

const x = (s: unknown) => String(s ?? "").replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));

/** Live listing feed for syndication partners (e.g. CommercialCafe "Send Us Your Feed"). */
export async function GET() {
  const rows = await feedData();
  const c = contact();
  const items = rows.map(({ p, media }) => `  <listing>
    <id>${x(p.prop_code || p.id)}</id>
    <title>${x(listingTitle(p))}</title>
    <transaction>${x(p.listing_type === "sale" ? "sale" : p.listing_type === "lease" ? "lease" : "sale,lease")}</transaction>
    <offering>${x(LISTING_LABEL[p.listing_type])}</offering>
    <property_type>${x(TYPE_LABEL[p.property_type])}</property_type>
    <status>${x(p.status)}</status>
    <address>${x(p.address)}</address>
    <city>${x(p.city)}</city>
    <state>${x(p.state)}</state>
    <zip>${x(p.zip)}</zip>
    <latitude>${x(p.lat)}</latitude>
    <longitude>${x(p.lng)}</longitude>
    <building_sf>${x(p.sqft)}</building_sf>
    <land_acres>${x(p.acreage)}</land_acres>
    <floors>${x(p.floors)}</floors>
    <year_built>${x(p.year_built)}</year_built>
    <zoning>${x(p.zoning)}</zoning>
    <price>${x(p.price_display || "Call for pricing")}</price>
    <description>${x(listingDescription(p, "feed", media))}</description>
    <url>${x(trackedUrl(p, "commercialcafe"))}</url>
    <photos>${media.filter((m) => ["rendering", "photo", "before"].includes(m.kind)).map((m) => `<photo caption="${x(m.caption)}">${x(m.url)}</photo>`).join("")}</photos>
    <floor_plans>${media.filter((m) => m.kind === "floor_plan").map((m) => `<file>${x(m.url)}</file>`).join("")}</floor_plans>
    <virtual_tours>${media.filter((m) => m.kind === "tour").map((m) => `<tour>${x(m.url)}</tour>`).join("")}</virtual_tours>
    <contact><name>${x(c.name)}</name><phone>${x(c.phone)}</phone><email>${x(c.email)}</email><company>Bricktown Real Estate</company></contact>
  </listing>`).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<listings generated="${new Date().toISOString()}" source="bricktownrealco.com">\n${items}\n</listings>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
