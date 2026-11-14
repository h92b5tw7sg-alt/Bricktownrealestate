import { contact, siteUrl } from "./site";
import { LISTING_LABEL, TYPE_LABEL, fullAddress, sizeLine, type Media, type Property } from "./types";

export const trackedUrl = (p: Pick<Property, "slug">, source: string) =>
  `${siteUrl()}/p/${p.slug}?utm_source=${encodeURIComponent(source)}&utm_medium=listing`;

export function listingTitle(p: Property) {
  const size = p.sqft ? `${Number(p.sqft).toLocaleString()} SF ` : "";
  const what = p.property_type === "land" ? "Development Site" : p.property_type === "parking" ? "Parking Lot" : p.property_type === "space" ? "Space" : "Building";
  return `${size}${what} ${LISTING_LABEL[p.listing_type]} — ${p.address}, Bricktown OKC`;
}

/** Plain-text listing description ready to paste into any platform. */
export function listingDescription(p: Property, source: string, media: Media[] = []) {
  const c = contact();
  const lines: string[] = [];
  if (p.headline) lines.push(p.headline, "");
  if (p.description) lines.push(p.description, "");
  else lines.push(`${TYPE_LABEL[p.property_type]} ${LISTING_LABEL[p.listing_type].toLowerCase()} in Bricktown, Oklahoma City's entertainment district — steps from Chickasaw Bricktown Ballpark, the canal and Paycom Center.`, "");
  if (p.highlights.length) { lines.push("Highlights:"); p.highlights.forEach((h) => lines.push(`• ${h}`)); lines.push(""); }
  const facts = [
    sizeLine(p) && `Size: ${sizeLine(p)}`,
    p.floors && `Floors: ${p.floors}`,
    p.year_built && `Built: ${p.year_built}`,
    p.zoning && `Zoning: ${p.zoning}`,
    `Pricing: ${p.price_display || "Call for pricing"}`,
  ].filter(Boolean) as string[];
  lines.push(...facts, "");
  if (media.some((m) => m.kind === "tour")) lines.push("3D walkthrough, renderings and floor plans:");
  else lines.push("Renderings, floor plans and details:");
  lines.push(trackedUrl(p, source), "");
  lines.push(`Contact ${c.name} · ${c.phone}${c.email ? " · " + c.email : ""}`);
  lines.push(`Address: ${fullAddress(p)}`);
  return lines.join("\n");
}

export function socialPost(p: Property, source: string) {
  const size = sizeLine(p);
  return [
    `🧱 ${LISTING_LABEL[p.listing_type].toUpperCase()} IN BRICKTOWN`,
    `${p.name !== p.address ? p.name + " — " : ""}${p.address}${size ? " · " + size : ""}`,
    p.headline || "Prime space in OKC's entertainment district.",
    "",
    `Renderings, floor plans & details 👉 ${trackedUrl(p, source)}`,
    `📞 ${contact().phone}`,
    "",
    "#Bricktown #OKC #OklahomaCity #CommercialRealEstate #ForLease #RestaurantSpace",
  ].join("\n");
}
