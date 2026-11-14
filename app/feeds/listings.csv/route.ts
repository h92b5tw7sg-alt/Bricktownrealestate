import { feedData } from "../shared";
import { contact } from "@/lib/site";
import { LISTING_LABEL, TYPE_LABEL } from "@/lib/types";
import { listingDescription, listingTitle, trackedUrl } from "@/lib/listing-copy";

export const revalidate = 300;
const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/** Same feed as CSV — for platforms that take a spreadsheet upload or bulk email. */
export async function GET() {
  const rows = await feedData();
  const c = contact();
  const head = ["id", "title", "offering", "property_type", "status", "address", "city", "state", "zip", "building_sf", "land_acres", "floors", "year_built", "zoning", "price", "description", "url", "photos", "floor_plans", "virtual_tours", "contact_name", "contact_phone", "contact_email"];
  const lines = rows.map(({ p, media }) => [
    p.prop_code || p.id, listingTitle(p), LISTING_LABEL[p.listing_type], TYPE_LABEL[p.property_type], p.status,
    p.address, p.city, p.state, p.zip, p.sqft, p.acreage, p.floors, p.year_built, p.zoning, p.price_display || "Call for pricing",
    listingDescription(p, "feed", media), trackedUrl(p, "csv"),
    media.filter((m) => ["rendering", "photo", "before"].includes(m.kind)).map((m) => m.url).join(" | "),
    media.filter((m) => m.kind === "floor_plan").map((m) => m.url).join(" | "),
    media.filter((m) => m.kind === "tour").map((m) => m.url).join(" | "),
    c.name, c.phone, c.email,
  ].map(q).join(","));
  return new Response([head.join(","), ...lines].join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'inline; filename="bricktown-listings.csv"', "Cache-Control": "public, max-age=300" },
  });
}
