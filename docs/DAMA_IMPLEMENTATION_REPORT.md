# DAMA KITCHEN — Implementation Report (SEO, GEO, AEO & conversion pass)

Date: 2026-11-13 · Branch `claude/elegant-hamilton-twBLg` · Builds on the self-hosted CMS.

## Implemented

### Launch-blocker fixes (see `DAMA_TECHNICAL_AUDIT.md` §4)

1. **Staging protection.** Indexing is off unless `SITE_INDEXING=true`. Three layers: `robots.txt Disallow: /`, an `X-Robots-Tag` header and a meta noindex tag. The sitemap is empty, and the admin dashboard warns.
2. **No fake destinations.** Shopee and TikTok default URLs are now empty. A marketplace button appears only after a real store URL is saved, and the GoFood/Grab defaults are off.
3. **No unverified contact details.** The default email and social handles are empty and hidden until the owner enters verified ones.
4. **Fabricated testimonials hidden.** They are seeded as hidden, and the testimonials block disappears when no real testimonial is visible.
5. **Coverage claim.** The default service area is now "Melayani area Jabodetabek." The unconfirmed nationwide-shipping claim was removed.
6. **Leads are never lost:**
   - every catering, gifting and corporate inquiry is stored (new `inquiries` table) **and** opens WhatsApp;
   - honest confirmation copy;
   - spam protection (honeypot, same-origin check, 5 submissions per 10 minutes per IP);
   - first-touch UTM attribution;
   - new **Admin → Permintaan masuk** with statuses (new → contacted → quoted → won/lost/spam), notes, a WhatsApp/email shortcut and delete.
7. **LocalBusiness markup removed.** FoodEstablishment is replaced by a correct Organization entity.

### Additions

- **`/corporate`.** A built-in, admin-editable page covering:
  - services: DAMA KAPAU nasi box for office events, TANDO MATO corporate hampers;
  - process steps, a corporate inquiry form, and FAQ;
  - Service JSON-LD.
- **`/faq`.** An answer-first hub generated from verified admin data, with FAQPage + BreadcrumbList.
- **Entity graph.** Organization `#organization`, WebSite `#website` and Brand `<slug>#brand` per sub-brand. Product, BlogPosting and Service reference these IDs.
- **Product pages.** New owner-filled fields (serving/weight, ingredients, storage, preparation) are shown only when present. Also: sub-brand FAQ, related articles, and a `view_item` event.
- **Articles.** Short answer box, sources (`citation`), related products (linked both ways), modified date.
- **Homepage seed.** Featured products and latest Catatan Dapur blocks. Each disappears when empty.
- **`/llms.txt`.** Live index of published URLs.
- **AI crawler policy.** Search and answer crawlers are always allowed. AI-training crawlers are allowed by default, with an owner switch in Site Settings.
- **Organization description field** (Site Settings), used in JSON-LD, `/faq` and `llms.txt`.
- **Analytics.** GTM or GA4 plus Clarity via env vars. Events:
  - page_view, view_item_list, select_item, view_item
  - click_whatsapp, click_marketplace
  - form_start, generate_lead
  - view_catering / view_gifting / view_corporate

  Also: GSC/Bing verification meta tags and UTM capture.
- **SEO polish:**
  - title format `[Topic] | DAMA KITCHEN`;
  - unique descriptions for custom pages;
  - `/faq` in the sitemap; Corporate, Catatan Dapur and Tanya jawab in the default footer;
  - `robots.txt` evaluated at runtime.
- **Accessibility.**
  - Primary buttons and accent surfaces use deep terracotta (#9A4730, the brand's darker terracotta step) for AA contrast.
  - Full-strength cream text on terracotta.
  - The logo link's accessible name now matches its visible text.
- **Database.** Migration `0001_seo_conversion` adds the inquiries table and the new product and article columns. It is applied automatically and is additive.
- **QA tooling.** `tests/e2e/qa-crawl.cjs` (SEO/structured-data crawler) and an updated acceptance suite.

## Simplified (and why)

| Brief item | Simplification |
| --- | --- |
| Sanity CMS | Not re-added. The owner-mandated self-hosted CMS already covers it (`DAMA_SANITY_SETUP.md`). |
| CRM | Leads table + status workflow in the admin. Email notifications need a provider (`lib/email.ts` stub, off). |
| Knowledge graph | JSON-LD `@graph` with stable IDs |
| WebPage entity per page | Not emitted separately. Product, BlogPosting, Service and FAQPage carry the page-level meaning. |
| Author entity | Text author on articles |
| Consent management | Not built. Analytics loads only when IDs are set. The legal decision is documented. |

## Deferred

- Location landing pages and `/area-layanan` (no verified per-city data).
- Author profiles.
- AI-visibility automation, vector search, RAG, chatbot.
- Competitor monitoring.
- Article writing: topics are in `DAMA_CONTENT_BACKLOG.md`. No facts were invented.

## Verification performed

| Test | Result |
| --- | --- |
| `pnpm build`, `tsc`, `next lint` | Pass |
| Acceptance suite (production build, fresh MariaDB DB, real admin UI) | **23/23**. Includes the catering + corporate leads stored and visible in the admin, the marketplace button hidden until a URL is set, and the WhatsApp number change propagating. |
| QA crawl, production mode | 36 sitemap URLs + 4 extra + 39 internal links: **0 issues** (status, unique title and description, canonical, single H1, JSON-LD parse, img alt, broken links) |
| Staging mode | robots `Disallow: /`, `X-Robots-Tag: noindex`, meta noindex, empty sitemap. Production shows none of these. |
| Lighthouse mobile (simulated, local) | Performance 93–97, SEO 100, Best Practices 100, Accessibility 96–100 (100 after the contrast fix on re-run pages), CLS 0, lab LCP 2.6–3.2 s |
| Responsive | Screenshots at 390 px (iPhone 13) and 1366 px; mobile menu exercised in tests |

## Remains incomplete / needs owner input

See `DAMA_LAUNCH_CHECKLIST.md` section A2 and the final summary: store URLs, verified contacts, photos, prices, product specs, real testimonials, analytics IDs, katering copy confirmation, and Hostinger deployment.
