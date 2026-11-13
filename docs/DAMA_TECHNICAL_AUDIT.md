# DAMA KITCHEN — Technical Audit (SEO / GEO / AEO / Conversion pass)

Date: 2026-11-13 · Branch `claude/elegant-hamilton-twBLg`. The audit was done before this pass's changes. Findings are verified against the code, not taken from older descriptions.

## 1. Brand reference documents

None of these were found in the repository:

- Brand Playbook & Identity System
- Visual Identity Guideline
- Photography & Videography Guideline
- Strategic Deck
- Mesin Taraso Disayang Growth System
- Instagram & Threads Content Plan

Their contents were **not** assumed. Work used the brand foundation in the project brief, plus the copy already in the site (`content/*.ts`, approved during the original build).

## 2. Existing architecture (verified)

| Area | Finding |
| --- | --- |
| Framework | Next.js **14.2.5**, App Router, React 18.3, TypeScript strict, `output: 'standalone'` |
| Package manager | pnpm 10.33 (`pnpm-lock.yaml`) |
| Styling | Tailwind 3.4 with CSS-variable design tokens (colors, radius, spacing, fonts editable in the admin) |
| Fonts | `next/font` with Playfair Display and Poppins preloaded, plus 6 optional fonts (not preloaded) |
| Data / CMS | **Self-hosted CMS** (MySQL/MariaDB + Drizzle) at `/admin`. Sanity was **removed** in the previous phase at the owner's request ("No Sanity, no hosted CMS"). There is no Sanity configuration, project or dependency. See `DAMA_SANITY_SETUP.md`. |
| Routing | Core pages; 4 static sub-brand routes plus catch-all; `/menu/[slug]`; `/catatan-dapur/[slug]`; custom pages and redirects via `[...slug]` |
| Rendering | Server-rendered per request from published DB content (cached with tag invalidation) |
| Metadata | `lib/seo.ts buildMetadata`: title, description, canonical, OG/Twitter, noindex per page |
| Sitemap / robots | Dynamic `sitemap.xml` from published content; `robots.ts` disallowing /admin, /api, /go |
| JSON-LD | Organization+FoodEstablishment, Product, BlogPosting, BreadcrumbList, FAQPage |
| Forms | Catering and gifting forms build a WhatsApp prefill. `/api/inquiry` called an email stub that never sends. |
| WhatsApp | Number from admin settings (`6281181207201`); `/go/whatsapp` redirect; product-specific prefill |
| Analytics | None |
| Tests | Playwright acceptance suite `tests/e2e` (23 checks) |

**Build before changes:** `pnpm build` succeeded; lint and typecheck were clean.

## 3. What already works (preserved)

- Admin CMS with draft/preview/publish, page builder, products, articles, media, settings and backups. Tested 23/23.
- Responsive layout, brand design system, sub-brand marker colors and accessible focus states.
- Per-page SEO fields, canonical URLs, dynamic sitemap, automatic 301 redirects on slug change.
- Product detail pages with Product JSON-LD (offers only when a price is set).

## 4. Problems found

### Launch blockers (fixed in this pass)

| # | Issue | Risk |
| --- | --- | --- |
| B1 | **No staging protection.** A staging or Hostinger preview deployment would be crawlable and indexable. | Duplicate or unfinished content indexed before launch |
| B2 | **Fake marketplace destinations.** Shopee and TikTok buttons pointed to `https://shopee.co.id/` and `https://www.tiktok.com/` (generic homepages, marked TODO). | CTAs that look functional but lead nowhere |
| B3 | **Unverified contact details** shown as fact: `halo@damakitchen.id`, `@damakitchen` on Instagram/TikTok/Threads (all marked TODO). | Possibly wrong or someone else's accounts |
| B4 | **Fabricated testimonials** (Rina, Pak Hendra, Sari) **visible** on the homepage. | Fake reviews; consumer-protection and trust risk |
| B5 | **Unverified coverage claim:** "Pengiriman frozen ke seluruh Indonesia" in the default service area. | Operational claim not confirmed |
| B6 | **Inquiry form overclaimed.** It said "pesanmu sudah kami terima", but nothing was stored and the email adapter is a stub. The lead was lost if the visitor didn't press send in WhatsApp. | Lost leads; misleading confirmation |
| B7 | `FoodEstablishment` (a LocalBusiness subtype) without an address or venue. | Misleading LocalBusiness markup |

### Should improve (done in this pass)

- No `/corporate` page and no corporate form. Corporate gifting and DAMA KAPAU corporate nasi box exist in the approved copy.
- No answer-first FAQ hub. FAQs were scattered across sub-brand pages and accordions.
- No consistent entity graph: no stable `@id`s, sub-brands not linked to the organization, products not linked to sub-brands.
- Products lack fields for serving, ingredients, storage and preparation. Articles lack a short answer, sources, related products and a modified date.
- No analytics, conversion events or UTM attribution. No GSC/Bing verification support.
- No `llms.txt`. No AI crawler policy.
- Title separator `·` (the brief prefers `|`).
- Custom pages fell back to one shared meta description.
- Accessibility:
  - cream text on terracotta buttons at 3.48:1 (WCAG AA needs 4.5:1);
  - an eyebrow label at 4.41:1;
  - the logo link's accessible name didn't match its visible text.

### Needs owner confirmation (content, not code)

- Katering page copy mentions **prasmanan** and **"10–200 pax"**. Prasmanan/buffet is the **HIDANG BASAMO** line, which is currently **disabled** (not live). Confirm the capacity and whether prasmanan is offered today.
- All product prices are empty, and no real photography is in the repository.
- KAPAU lists GoFood/GrabFood channels, which are disabled site-wide. KAPAU therefore routes to WhatsApp.

## 5. Preserve / simplify / postpone

| Preserve | Simplify | Postpone |
| --- | --- | --- |
| Self-hosted CMS (not re-adding Sanity) | Leads stored in DB + WhatsApp, not a CRM | Location landing pages (no verified per-city data) |
| Existing URLs and redirects | Analytics via env IDs + one delegated listener (no SDKs) | `/area-layanan` (service area lives on Kontak/FAQ) |
| Design system and copy | Entity graph as JSON-LD `@graph`, not a knowledge-graph DB | Author profiles as entities |
| Page builder | `llms.txt` generated from live data | Vector search, RAG, chatbot, AI-visibility automation |
