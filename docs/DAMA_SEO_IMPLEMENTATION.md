# DAMA KITCHEN — Technical SEO Implementation

Only implemented and verified behavior is described here.

## Metadata

- **Helper.** `lib/seo.ts → buildMetadata()` applies to every indexable route: core pages, sub-brands, products, articles, custom pages, `/faq`, `/catatan-dapur`.
- **Title.** The SEO title from the admin, else `[Topic] | DAMA KITCHEN`. The homepage uses `DAMA KITCHEN — Taraso Disayang` or Site Settings → SEO bawaan.
- **Description:**

  | Content | Source |
  | --- | --- |
  | Built-in pages | admin SEO field, else a page-specific default |
  | Products | blurb |
  | Articles | excerpt |
  | Sub-brands | lead |
  | Custom pages | first section intro/text |

  The QA crawl confirms that **no two pages share a title or description**.
- **Open Graph / Twitter.** Title, description and image come from the SEO tab. Defaults are the page title, description and the photo of the item. When no image is set, the generated `/opengraph-image` is used.
- **Robots.** Per-page *noindex* switch. Noindex pages are also removed from the sitemap.
- **Verification.** `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` env vars emit the verification meta tags.

## Canonicals

- Self-referencing absolute URLs on `NEXT_PUBLIC_SITE_URL`, which must be the production `https://` domain at **build** time.
- No trailing slash (Next.js default). The homepage canonical is the bare domain.
- An editor override is accepted only as a same-site path or an `https://` URL. Invalid values are rejected when saving.
- Parameterized views (`/catatan-dapur?kategori=…`) keep the canonical of the base page.

## Sitemap — `/sitemap.xml` (dynamic)

- **Includes:**
  - published, non-noindex built-in pages;
  - enabled sub-brands;
  - published products `/menu/<slug>`;
  - published articles;
  - `/catatan-dapur`, `/faq`;
  - published custom pages.
- **lastModified:** the publish or update time.
- **Excludes:** drafts, archived products, disabled lines (HIDANG BASAMO), `/admin`, `/api`, redirects.
- **Staging:** the sitemap is **empty** unless `SITE_INDEXING=true`.

## Robots & staging protection

- **Switch.** `SITE_INDEXING=true` is required for indexing. It is read at runtime, so no rebuild is needed.
- **Staging (default).** Three independent layers:
  1. `robots.txt` → `Disallow: /`;
  2. `X-Robots-Tag: noindex, nofollow` on every response (middleware);
  3. `<meta name="robots" content="noindex, nofollow">`.

  The admin dashboard shows a "Mode staging" warning.
- **Production `robots.txt`** (`app/robots.txt/route.ts`):
  - `Allow: /`
  - `Disallow: /admin /api/ /go/`
  - `Sitemap: <domain>/sitemap.xml`

  CSS, JS and images are never blocked. The AI crawler policy is in `DAMA_GEO_AEO_IMPLEMENTATION.md`.

## Status codes & redirects

- **200** for live content.
- **404** (`app/(site)/not-found.tsx`) for missing, draft or disabled content.
- **301** for admin redirects. Old URLs redirect automatically when a published page, product or article slug changes, and older redirects are re-pointed so there are no chains.
- **302** for `/go/whatsapp`, a helper that is not indexed.

## Headings & semantics

- **Headings.** One `<h1>` per page: the page builder promotes the first section heading. Below it is H2/H3 order.
- **Landmarks.** `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`.
- **Breadcrumbs.** Visible breadcrumbs plus BreadcrumbList on products and articles; BreadcrumbList on `/faq`.

## Images

- **Processing.** Uploads are converted to WebP (max 2400px) plus 640/1280 variants. EXIF/GPS is stripped.
- **Delivery.** `srcset` with `sizes`; lazy loading except LCP images (`loading="eager"`); aspect-ratio boxes give CLS 0.
- **Names.** File names are descriptive: the uploaded name is slugified, e.g. `a1b2c3d4-rendang-sapi.webp`.
- **Alt text.** Editable everywhere. The media library flags images without alt. The QA crawl found **no `<img>` without alt**.

## Internal linking

| From | Links to |
| --- | --- |
| Header / footer | core pages, sub-brands, `/corporate`, `/catatan-dapur`, `/faq` |
| Homepage | sub-brand cards, featured products, latest articles, channel guide |
| Product page | sub-brand, sibling products, sub-brand FAQ, articles that mention it |
| Article | related articles (manual or same category), products discussed, category filter |
| `/faq` | links to `/cerita`, `/menu`, `/pesan`, `/corporate`, each sub-brand |
| `/corporate` | DAMA KAPAU and TANDO MATO pages |

## Verification performed (local production build, MariaDB)

| Check | Result |
| --- | --- |
| QA crawl (`tests/e2e/qa-crawl.cjs`): 36 sitemap URLs + `/faq` `/corporate` `/llms.txt` `/robots.txt`, plus 39 internal links | All 200; unique titles and descriptions; self-canonical; exactly one H1; all JSON-LD parses; no image without alt; no broken internal links |
| Staging server (no `SITE_INDEXING`) | robots `Disallow: /`, `X-Robots-Tag: noindex`, meta noindex, empty sitemap |
| Lighthouse SEO score (mobile, simulated) | 100 on `/`, `/menu/lamak-rendang`, `/corporate`, `/faq`, `/catatan-dapur` |

**Post-launch validation (not verifiable before launch):** Search Console coverage and indexing, live rich-result eligibility.
