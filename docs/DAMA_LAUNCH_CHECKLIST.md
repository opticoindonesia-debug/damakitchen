# DAMA KITCHEN — Production Launch Checklist

Switch the production domain only when every **Before launch** item is checked on **staging**.

## A. Acceptance criteria — current status

Verified on the production build (`next build` + standalone server) against MariaDB 10.11, using an automated browser test of the real admin UI (`tests/e2e/acceptance.cjs`, 23/23 checks) plus the manual commands noted. Test date: 2026-11-13.

| # | Criterion | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Login to `/admin` | **PASS** | First-run setup refuses a wrong token. Setup with the token, then login, then dashboard. |
| 2 | Change homepage headline and publish | **PASS** | Hero heading edited in the page builder, then Terbitkan. |
| 3 | Published homepage reflects the new headline | **PASS** | Anonymous request shows the new headline as the page `<h1>`. |
| 4 | Replace homepage images | **PASS** | Upload via media picker in the hero; public page renders `/media/…webp` with srcset and alt text. |
| 5 | Add and edit products | **PASS** | Created a product, then renamed it; `/menu/<slug>` shows the new name and Product JSON-LD. |
| 6 | Change product prices | **PASS** | Quick price edit in the list; `/menu` shows "Rp 123.456". |
| 7 | Create and publish an article | **PASS** | Rich text with bold and tags; the article page returns 200 with BlogPosting JSON-LD and is listed on `/catatan-dapur`. |
| 8 | Add, remove, hide and reorder sections | **PASS** | Added a Teks section and moved it to the top, hid the quote, deleted the pillars block. Public order and visibility are correct. |
| 9 | Change global colors | **PASS** | Primary → #2A5D5D and pill buttons; public CSS variables updated. |
| 10 | Change navigation and footer | **PASS** | Menu label and footer note updated publicly. |
| 11 | Preview before publishing | **PASS** | Saved draft is visible in preview (with banner) only; the anonymous homepage is unchanged. |
| 12 | Drafts are not public | **PASS** | Draft article and draft page return 404, and are not listed or in the sitemap. |
| 13 | SEO metadata updates correctly | **PASS** | `<title>`, meta description, canonical and og:title match the SEO fields. |
| 14 | Sitemap includes published pages and articles | **PASS** | Includes the article, custom page and product. Excludes drafts and the disabled HIDANG BASAMO. robots.txt blocks /admin. |
| 15 | WhatsApp links and inquiry flows work | **PASS** | `/go/whatsapp` redirects to wa.me. Changing the number in Settings updates the redirect, the channel buttons and the catering form link. Disabled GoFood button not rendered. |
| 16 | Media persists after redeploy | **PASS (local simulation)** | Deleted `.next`, rebuilt, restarted: identical SHA-256 for the uploaded image. **Re-confirm on Hostinger** (item B7). |
| 17 | Backup restores | **PASS** | Admin download, change, then admin restore brings the price back. CLI restore into an empty DB gives identical row counts and checksums, and a second server on it serves the site. |
| 18 | Production build succeeds | **PASS** | `next build` succeeds with no DB at build time; lint and typecheck clean. |
| 19 | Application runs on Hostinger | **NOT TESTED** | The sandbox has no Hostinger access. Complete section B. |
| 20 | No Sanity dependency remains | **PASS** | No Sanity package in `package.json` or `pnpm-lock.yaml`; no Sanity code, env vars or Studio. Only the dependency-free one-time importer remains. |

Security checks also passed:

- unauthenticated and forged-cookie access blocked;
- cookie HttpOnly / SameSite=Lax / Secure;
- cross-origin upload/delete rejected (CSRF);
- SVG, fake and oversize uploads rejected; EXIF stripped;
- XSS payload sanitized;
- security headers present;
- login lockout after repeated failures.

## A2. SEO / GEO / conversion readiness

| Area | Status | Notes |
| --- | --- | --- |
| Website (pages, responsive, navigation) | **READY** | QA crawl: 0 issues across 36 sitemap URLs; mobile and desktop checked |
| Brand accuracy | **READY WITH CONFIGURATION** | Unverified placeholders removed or hidden; owner must confirm katering capacity/prasmanan copy and service area |
| Technical SEO | **READY WITH CONFIGURATION** | Needs `NEXT_PUBLIC_SITE_URL` (at build) + `SITE_INDEXING=true` on production |
| Structured data / entities | **READY** | Valid JSON-LD on all pages; richer with logo/photos once uploaded |
| GEO / AEO (`/faq`, `llms.txt`, crawler policy) | **READY** | AI visibility itself is post-launch validation |
| Conversion (WhatsApp, inquiries, corporate) | **READY** | Leads stored + WhatsApp; marketplace buttons appear once real store URLs are set |
| Marketplace links | **BLOCKED on owner input** | No verified Shopee/TikTok store URLs yet. Buttons stay hidden (not broken). |
| Analytics | **READY WITH CONFIGURATION** | Needs GTM/GA4 IDs + GSC/Bing verification |
| Performance | **READY** | Lighthouse mobile 93–97, CLS 0; field Core Web Vitals post-launch |
| Content (photos, prices, articles, testimonials) | **READY WITH CONFIGURATION** | Site works without them; quality improves as they are added |
| Location pages / author profiles | **DEFERRED** | Need verified data |

## B. Before launch (on Hostinger staging)

- [ ] B1. Node.js app created from the GitHub branch; Node 20/22; build log OK.
- [ ] B2. Environment variables set (`DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_SETUP_TOKEN`, `MEDIA_STORAGE=database`).
- [ ] B3. First request: the runtime log shows migrations applied and initial content imported.
- [ ] B4. Owner account created at `/admin/setup`; **`ADMIN_SETUP_TOKEN` removed** and app restarted; dashboard warning gone.
- [ ] B5. Old Sanity content exported and imported (`pnpm import:sanity … --apply`); import report reviewed; each imported page and article reviewed and **Terbitkan**.
- [ ] B6. Run `tests/e2e/acceptance.cjs` against staging on a **fresh** staging DB **or** walk through criteria 1–17 by hand (owner manual chapters 3–15).
- [ ] B7. Upload a photo, **redeploy**, confirm the photo still loads (criterion 16 on Hostinger).
- [ ] B8. Download a backup, then restore it on staging via Admin → Cadangan; site unchanged afterwards (criterion 17 on Hostinger).
- [ ] B9. Cron Job for `/api/backup/cron` added (if `BACKUP_DIR` used); next day a backup file exists.
- [ ] B10. Content readiness (see the migration report):
  - [ ] testimonials real or hidden
  - [ ] Shopee/TikTok store URLs set
  - [ ] email/socials confirmed
  - [ ] prices decided
  - [ ] real photos uploaded with alt text
- [ ] B11. Palette reviewed by the owner (brief palette vs previous shades).
- [ ] B12. Mobile check on a real phone: menu, WhatsApp buttons, inquiry form, product page.
- [ ] B13. Lighthouse (mobile) on Beranda and a product page: Performance ≥ 85, SEO ≥ 95, Accessibility ≥ 95.
- [ ] B14. Staging stays **unindexed**: `SITE_INDEXING` **not** set. Check `/robots.txt` shows `Disallow: /` and responses carry `X-Robots-Tag: noindex`.
- [ ] B15. Submit a test catering form and a test corporate form. Both appear in Admin → Permintaan masuk and WhatsApp opens with the summary. Then delete the test inquiries.
- [ ] B16. Pengaturan situs: verified email/socials entered (or left empty); Shopee/TikTok store URLs entered if available; organization description reviewed; AI-training crawler choice made.
- [ ] B17. Review copy flagged in `DAMA_TECHNICAL_AUDIT.md` §4: katering "prasmanan" and "10–200 pax", service area.

## C. Launch (cut-over)

- [ ] C1. Download a fresh backup from staging and store it off-site.
- [ ] C2. Point `damakitchen.id` to Hostinger; SSL installed; **Force HTTPS** on.
- [ ] C3. `NEXT_PUBLIC_SITE_URL=https://damakitchen.id`, then **redeploy**.
- [ ] C4. Set **`SITE_INDEXING=true`** on production and restart. Check `https://damakitchen.id/sitemap.xml`, `/robots.txt` (Allow + Sitemap line), `/llms.txt` and a canonical tag all use the production domain, and that pages have **no** `X-Robots-Tag: noindex`.
- [ ] C4b. Set `GTM_ID` (or `GA4_ID`), `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` (see `DAMA_ANALYTICS_SETUP.md`). Check GA4 Realtime shows page_view and click_whatsapp.
- [ ] C5. Disconnect the Vercel project and remove the domain there; then merge to `main` / production branch (deployment guide §10).
- [ ] C6. Google Search Console + Bing Webmaster Tools: verify the domain and submit the sitemap. Validate a product and an article URL with Google's Rich Results Test.
- [ ] C7. Remove old Sanity env vars everywhere; keep the Sanity export file as an archive.

## D. After launch

- [ ] D1. Day 1: check the Hostinger runtime log for errors; test WhatsApp and inquiry from a phone.
- [ ] D2. Weekly: owner downloads a backup (Admin → Cadangan) and stores it off-site.
- [ ] D3. Monthly: confirm the scheduled backups exist; test-restore one into a scratch DB (database guide §4C).
- [ ] D4. Before every code update: backup, deploy to staging, check, then production.
- [ ] D5. Weekly: work through new inquiries (Admin → Permintaan masuk) and update their status (contacted / quoted / won / lost).
- [ ] D6. Monthly: AI-visibility check (`DAMA_GEO_AEO_IMPLEMENTATION.md` §7), Search Console coverage, publish 2–4 articles from `DAMA_CONTENT_BACKLOG.md`.

## E. Post-launch validation (cannot be verified before launch)

Google and Bing indexing; rich-result eligibility; AI assistant mentions and accuracy; Google Business Profile (owner to create; no address or hours invented); live analytics data; marketplace conversions; field Core Web Vitals (CrUX).
