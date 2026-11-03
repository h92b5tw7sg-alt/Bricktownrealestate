export const BRAND = "Bricktown Real Estate";
export const DOMAIN = "bricktownrealco.com";

export function siteUrl() {
  return (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://bricktownrealco.com").replace(/\/$/, "");
}

export const contact = () => ({
  name: process.env.CONTACT_NAME || "Brett Brewer",
  phone: process.env.CONTACT_PHONE || "405-568-5500",
  email: process.env.CONTACT_EMAIL || "",
});

export const telHref = (p: string) => `tel:+1${p.replace(/\D/g, "").replace(/^1/, "")}`;
