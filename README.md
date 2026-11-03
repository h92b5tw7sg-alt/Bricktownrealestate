# bricktownrealco.com

Bricktown Real Estate listing site. Every building and lot gets a page with renderings, photos, floor plans and an inquiry form, plus a printable sign with a QR code.

**Stack:** Next.js 16 (Vercel) · Supabase (database + file storage) · Resend (optional inquiry emails). Separate from BricktownTix.

## How the signs work
- Each sign's QR encodes `bricktownrealco.com/q/<property>`.
- That route logs the scan (no raw IPs stored) and opens `/p/<property>?src=qr`, which greets the visitor and tags their inquiry as "Sign scan".
- Admin → **Signs & QR codes**: print-ready sign layouts (landscape or portrait) and vector SVG / 3000px PNG QR files for the sign shop.
- Don't change a property's web address after its sign is printed.

## Admin (`/admin`)
- Add/edit properties, publish or unpublish, mark Under Contract / Leased / Sold
- Upload renderings, photos, floor plans (images or PDF), brochures, video links
- QR scan counts per property (all time + 7 days) and inquiries

## Setup
1. **Supabase** (project "Bricktown Real Estate"): SQL Editor → run `supabase/migrations/0001_init.sql`, then `0002_seed_properties.sql`.
2. **Vercel**: Import this repo → add the variables in `.env.example` → Deploy.
3. **Domain**: Vercel → Settings → Domains → add `bricktownrealco.com` and `www.bricktownrealco.com`, then set the DNS records Vercel shows at the registrar.
