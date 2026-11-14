/** Listing platforms we post to. `key` is the utm_source used in tracked links back to our site. */
export type Platform = {
  key: string;
  name: string;
  addUrl: string;
  cost: string;
  note: string;
  leaseOnly?: boolean;
};

export const PLATFORMS: Platform[] = [
  { key: "crexi", name: "Crexi", addUrl: "https://www.crexi.com/add-listing", cost: "Free", note: "Owners can list lease space only. Big national tenant/broker audience.", leaseOnly: true },
  { key: "commercialcafe", name: "CommercialCafe network", addUrl: "https://www.commercialcafe.com/add-a-listing", cost: "Free", note: "One listing posts to CommercialCafe, CommercialSearch and PropertyShark. Accepts our feed URL." },
  { key: "loopnet", name: "LoopNet", addUrl: "https://www.loopnet.com/", cost: "Paid for public visibility", note: "Free Basic listings are only visible to CoStar subscribers; upgrade to be seen." },
  { key: "cimls", name: "CIMLS", addUrl: "https://www.cimls.com/", cost: "Free", note: "Free basic membership; Gold ranks above free listings." },
  { key: "google", name: "Google Business / Search", addUrl: "https://search.google.com/search-console", cost: "Free", note: "Submit sitemap.xml in Search Console so property pages get indexed." },
  { key: "facebook", name: "Facebook / Instagram", addUrl: "https://business.facebook.com/", cost: "Free posts · paid boosts", note: "Post each listing with its tracked link; boost to OKC business owners." },
  { key: "linkedin", name: "LinkedIn", addUrl: "https://www.linkedin.com/", cost: "Free", note: "Post to your profile and OKC CRE / restaurant-owner groups." },
  { key: "email", name: "Email blast", addUrl: "", cost: "Free", note: "Send to brokers and past tenants with the tracked link." },
];

export const PLATFORM_KEYS = new Set(PLATFORMS.map((p) => p.key).concat(["qr", "direct"]));

export const STATUS_OPTS = [
  { v: "todo", l: "To do" },
  { v: "listed", l: "Listed" },
  { v: "paused", l: "Paused" },
  { v: "na", l: "N/A" },
] as const;

export function cleanSource(s: string | undefined | null) {
  const v = (s ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32);
  return v || "direct";
}
