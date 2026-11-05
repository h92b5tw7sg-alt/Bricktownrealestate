export type ListingType = "sale" | "lease" | "sale_or_lease";
export type Status = "available" | "coming_soon" | "under_contract" | "leased" | "sold";
export type PropertyType = "building" | "space" | "land" | "parking";
export type MediaKind = "photo" | "rendering" | "floor_plan" | "brochure" | "video" | "before" | "tour";

export type Property = {
  id: string;
  slug: string;
  prop_code: string | null;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string | null;
  property_type: PropertyType;
  listing_type: ListingType;
  status: Status;
  published: boolean;
  sqft: number | null;
  acreage: number | null;
  floors: number | null;
  year_built: number | null;
  zoning: string | null;
  price_display: string | null;
  headline: string | null;
  description: string | null;
  highlights: string[];
  hero_url: string | null;
  lat: number | null;
  lng: number | null;
  sort: number;
};

export type Media = {
  id: string;
  property_id: string;
  kind: MediaKind;
  url: string;
  storage_path: string | null;
  caption: string | null;
  sort: number;
};

export const LISTING_LABEL: Record<ListingType, string> = {
  sale: "For Sale",
  lease: "For Lease",
  sale_or_lease: "For Sale or Lease",
};

export const STATUS_LABEL: Record<Status, string> = {
  available: "Available",
  coming_soon: "Coming Soon",
  under_contract: "Under Contract",
  leased: "Leased",
  sold: "Sold",
};

export const TYPE_LABEL: Record<PropertyType, string> = {
  building: "Building",
  space: "Space",
  land: "Land / Lot",
  parking: "Parking",
};

export const KIND_LABEL: Record<MediaKind, string> = {
  photo: "Photos",
  rendering: "Renderings",
  floor_plan: "Floor Plans",
  brochure: "Brochures",
  video: "Video",
  before: "Today (compare slider)",
  tour: "3D / 360 Tours",
};

export function sizeLine(p: Pick<Property, "sqft" | "acreage">) {
  const parts: string[] = [];
  if (p.sqft) parts.push(`${Number(p.sqft).toLocaleString()} SF`);
  if (p.acreage) parts.push(`${Number(p.acreage).toLocaleString(undefined, { maximumFractionDigits: 2 })} AC`);
  return parts.join(" · ");
}

export const fullAddress = (p: Pick<Property, "address" | "city" | "state" | "zip">) =>
  `${p.address}, ${p.city}, ${p.state}${p.zip ? " " + p.zip : ""}`;

export const mapsUrl = (p: Pick<Property, "address" | "city" | "state" | "zip">) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress(p))}`;

/** Turns a tour/video link into an embeddable URL. Only known hosts are embedded. */
export function embedUrl(url: string): string | null {
  let u: URL;
  try { u = new URL(url); } catch { return null; }
  if (u.protocol !== "https:") return null;
  const h = u.hostname.replace(/^www\./, "");
  const yt = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (yt && /youtu/.test(h)) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  if (h.endsWith("matterport.com")) {
    const m = u.searchParams.get("m");
    return m ? `https://my.matterport.com/show/?m=${encodeURIComponent(m)}&play=1` : url;
  }
  if (["kuula.co", "cloudpano.com", "app.cloudpano.com", "momento360.com", "tour.giraffe360.com", "my.matterport.com"].some((d) => h === d || h.endsWith("." + d))) return url;
  if (h === "google.com" && u.pathname.startsWith("/maps/embed")) return url;
  return null;
}
