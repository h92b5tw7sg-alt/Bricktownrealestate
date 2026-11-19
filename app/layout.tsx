import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "@fontsource/anton/400.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "./globals.css";
import { Suspense } from "react";
import RevealObserver from "@/components/RevealObserver";
import { BRAND, contact, siteUrl, telHref } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${BRAND} — Buildings & lots for sale and lease in Bricktown, OKC`, template: `%s · ${BRAND}` },
  description: "Available buildings, retail, restaurant and nightlife space, and development lots for sale or lease in Bricktown, Oklahoma City.",
  openGraph: { siteName: BRAND, type: "website" },
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const c = contact();
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">Skip to main content</a>
        <header className="site-header">
          <div className="inner">
            <Link href="/" className="brand" aria-label={`${BRAND} home`}>
              <img src="/brand-logo.webp" alt="Bricktown Real Estate Co." className="brand-logo" width="1095" height="255" />
            </Link>
            <a className="header-call" href={telHref(c.phone)}><span className="hc-label">Call </span>{c.phone}</a>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="wrap">{children}</main>
        <footer className="site-footer">
          <strong>{BRAND}</strong>
          <div style={{ marginTop: 6 }}>Bricktown · Oklahoma City, Oklahoma</div>
          <div style={{ marginTop: 6 }}>
            {c.name} · <a href={telHref(c.phone)}>{c.phone}</a>
            {c.email && <> · <a href={`mailto:${c.email}`}>{c.email}</a></>}
          </div>
          <div className="small" style={{ marginTop: 14, opacity: .75 }}>
            Information deemed reliable but not guaranteed. Availability, pricing and terms subject to change.
          </div>
          <div style={{ marginTop: 10 }}><Link href="/admin" style={{ color: "#8f837c", fontSize: ".8rem" }}>Owner login</Link></div>
        </footer>
        <Suspense fallback={null}><RevealObserver /></Suspense>
      </body>
    </html>
  );
}
