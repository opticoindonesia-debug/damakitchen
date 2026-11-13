# DAMA KITCHEN — Self-hosted CMS Architecture

Status: implemented on branch `claude/elegant-hamilton-twBLg`. Replaces the former Sanity integration completely.

## 1. Goals and constraints

- No hosted CMS, no paid third-party database, media, auth or deployment service, and no subscription.
- Everything runs on DAMA's own Hostinger account. The source lives in a private GitHub repo.
- The owner edits all important content without code. Drafts are never public.
- The existing design, URLs, SEO and functionality (WhatsApp, marketplaces, inquiry forms) are preserved.
- Simple and maintainable beats clever: one Next.js app, one MySQL database.

## 2. System overview

```
Browser ──HTTPS──► Hostinger (Node.js app: Next.js 14 standalone server)
                     ├─ Public site  app/(site)/…   → reads PUBLISHED content
                     ├─ Admin CMS    app/admin/…    → session-protected
                     ├─ APIs         app/api/admin/… (media, backup, preview)
                     ├─ Media        app/media/[key] → serves files from MySQL (or MEDIA_ROOT)
                     └─ lib/db ──mysql2 pool──► Hostinger MySQL / MariaDB
```

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 14 App Router, SSR, `output: 'standalone'` | Already used by the site. Hostinger Managed Node.js runs Next.js in server mode. |
| Database | MySQL 8 / MariaDB 10.6+ (Hostinger) | Included in Business/Cloud plans at no extra cost. |
| ORM | Drizzle ORM (Apache-2.0) + mysql2 (MIT) | Typed queries, plain SQL migrations, no binary engine to install. |
| Auth | Built-in: Node `crypto.scrypt`, DB sessions | No external auth provider and no native add-on to compile. |
| Media | sharp (Apache-2.0); stored in MySQL by default | Survives redeploys (Hostinger overwrites app folders on deploy). |
| Rich text | TipTap (MIT) → HTML, sanitized by sanitize-html (MIT) | Familiar document-style editing; crawlable HTML output. |
| Page builder | Schema-driven forms + dnd-kit (MIT) | No raw JSON or code editing. Every value is validated. |
| Validation | Hand-written cleaners (lib/sanitize.ts, lib/text.ts, lib/sections/validate.ts) | One definition drives both the admin forms and server validation. |

All new dependencies are free, open-source (MIT / Apache-2.0) and run inside the app. There are no usage fees.

## 3. Rendering and publishing model

- **Working copy vs published snapshot.**
  - Pages, articles and the three settings singletons (site, theme, navigation) keep a `draft` (working copy) and a `published` snapshot.
  - Saving and autosaving only write the draft.
  - **Terbitkan** (publish) copies the validated draft into `published`.
  - The public site reads `published` only.
- **Catalog records** are edited in place: products, sub-brands, testimonials, FAQ, pillars/values and redirects. Their `status`, `visible` or `enabled` fields control visibility. Products: `draft` / `published` / `archived`.
- **Preview.**
  - The admin enables Next.js draft mode via `/api/admin/preview/enable`.
  - Preview data is served only when draft mode is on **and** the request carries a valid admin session (`isPreview()` in `lib/cms`). Anonymous visitors can never see drafts, even with a copied cookie.
- **Caching.**
  - Public pages are rendered per request (`force-dynamic`).
  - Database reads go through `unstable_cache`, tagged `cms`.
  - Every admin save or publish calls `revalidateTag('cms')`, so changes are live immediately with no rebuild.
- **Built-in pages.**
  - The 7 core pages (Beranda, Cerita, Menu, Katering, Hadiah, Pesan, Kontak) are rows in `pages` with `builtin_key`.
  - If a page has no visible sections, its original coded layout renders as a safe fallback.
- **Routing.**
  - Dedicated routes: the core pages, sub-brands, `/menu/[slug]` (new product detail pages) and `/catatan-dapur/[slug]`.
  - The catch-all `app/(site)/[...slug]` serves:
    1. custom pages,
    2. sub-brands added later,
    3. redirects from the `redirects` table,
    4. a real 404 otherwise.
- **Slug changes.** Changing a published page, product or article URL automatically creates a 301 redirect from the old URL and re-points older redirects, so there are no chains.

## 4. Database schema (summary)

All tables have `created_at` / `updated_at` where relevant. Charset is utf8mb4. Source: `lib/db/schema.ts`. Migrations: `drizzle/` (embedded into the build as `lib/db/migrations.generated.ts`).

| Table | Purpose | Key fields / relations |
| --- | --- | --- |
| `admin_users` | Admin accounts | `email` (unique), `password_hash` (scrypt), `role` owner/editor, `is_active` |
| `sessions` | Server-side sessions | `id` = SHA-256 of the cookie token, FK `user_id`, `expires_at` (indexed) |
| `login_attempts` | Rate limiting | `ip`, `email`, `success`, indexed by time |
| `pages` | Page builder pages | `builtin_key` (unique), `slug`, `published_slug` (unique), `draft` JSON, `published` JSON, `status`, `has_changes`, `sort_order` |
| `sub_brands` | The sub-brand lines | `slug` (unique), copy fields, `marker_hex`, `hero_image`, `channels`, `faqs`, `cross_sell`, `extra_sections`, `seo`, `enabled`, `sort_order` |
| `product_categories` | Product grouping | `slug` (unique), `name`, `sort_order` |
| `products` | Menu / catalog | `slug` (unique), FK `sub_brand_id`, FK `category_id`, `price` (IDR), `price_note`, `availability`, `status`, `image`, `gallery`, `info`, `order_links`, `seo`, `sort_order` |
| `articles` | Catatan Dapur | working-copy columns + `published` snapshot, `published_slug` (unique), FK `category_id`, `related_ids`, `seo` |
| `article_categories`, `tags`, `article_tags` | Article taxonomy | `article_tags` is a many-to-many join |
| `testimonials`, `faqs`, `brand_items` | Small collections for data blocks | `visible`, `sort_order` (`brand_items.kind` = pillar/value) |
| `media` | Media library | `storage_key` (unique, public file name), `mime`, `kind`, `width`/`height`, `variants`, `alt`, `folder`, `checksum`, `version` |
| `media_blobs` | File bytes (database storage) | PK (`media_id`, `variant`), `longblob` |
| `settings` | Singletons: `site`, `theme`, `navigation` | `draft` JSON, `published` JSON, `has_changes` |
| `redirects` | 301/302 redirects | `from_path` (unique), `to_path`, `status_code` |
| `_migrations` | Applied migrations | created by the migration runner |

The spec's `PageSection`, `Navigation/NavigationItem`, `ThemeSettings` and `SEOSettings` tables are modeled differently, as JSON documents validated on every write:

- Page sections live in `pages.draft.sections` / `pages.published.sections`.
- Navigation and theme live in `settings`.
- SEO is a `seo` JSON column on each content type.

This keeps "edit a page → publish the whole page atomically" simple and reliable. Relational data that is queried or joined (products, sub-brands, categories, tags, media, redirects, users) uses real tables, foreign keys and indexes.

### Migrations

- **Startup.** On the first request after a deploy, `ensureReady()` (lib/bootstrap.ts):
  - applies pending migrations under a MySQL named lock (`GET_LOCK`), so concurrent processes are safe;
  - then seeds initial content into empty tables only (never overwrites).
- **Development.** Edit `lib/db/schema.ts`, then run `pnpm db:generate`. This writes the SQL to `drizzle/` and embeds it in the build.
- **Policy.** Migrations only add structure. A destructive change requires a backup first (see the database guide).

## 5. Page builder

- **One definition.** Section types are declared once in `lib/sections/definitions.ts` (fields, labels, options, defaults, show-if rules). That same definition:
  - generates the admin forms (`components/admin/SchemaForm.tsx`, `SectionsEditor.tsx`);
  - drives server validation (`lib/sections/validate.ts`). Unknown types and fields are dropped, every value is typed and bounded, links are allow-listed and rich text is sanitized.
- **Section types:**
  - Hero; Teks (rich text); Foto + Teks; Kutipan (testimonial / quote); Kartu (editorial / sub-brand / intro cards); Daftar poin; Ajakan (CTA); FAQ; Galeri; Formulir (catering / gifting inquiry); Kontak; Blok kustom; Pemisah.
  - Blok data otomatis, with these sources: sub-brands, products from one line, product grid by category, full menu, testimonials, FAQ, pillars, values, channels, channel guide, gift tiers, seasonal banner, latest articles, contact.
- **Per-section options:**
  - background (theme-based, so text contrast adapts automatically);
  - spacing, motif, divider, anchor;
  - device visibility (all / desktop / mobile) and photo position on desktop and mobile;
  - ratio, columns, alignment, width;
  - hide/show, duplicate, delete, drag-and-drop reorder (also keyboard and up/down buttons).
- **Rendering.** `components/builder/*` renders sections with the brand components. The first heading on a page becomes the single `<h1>`.

## 6. Media

- **Validation.** Upload types are checked by content (magic bytes / sharp decoding), not by file name:
  - Allowed: JPG, PNG, WebP, AVIF, GIF, PDF.
  - SVG is rejected because it is an XSS vector.
  - Maximum size is 8 MB.
- **Processing.** Images are auto-rotated, EXIF/GPS metadata is stripped, and they are converted to WebP (max 2400px) plus 640px and 1280px variants. Animated GIFs are kept as-is.
- **Storage.**
  - `MEDIA_STORAGE=database` (default) stores bytes in `media_blobs`.
  - `filesystem` stores them under `MEDIA_ROOT` (must be outside the deploy folder).
- **Serving.** `/media/<key>?w=640` picks the best variant. Responses send `ETag`, `Cache-Control`, `X-Content-Type-Options: nosniff` and a sandbox CSP. Public pages render `srcset` automatically.
- **Replace** keeps the same URL, so every page using the file updates.
- **Delete** checks where the file is used (scans all content). It warns and needs explicit confirmation if the file is in use.

## 7. Security model

| Concern | Implementation |
| --- | --- |
| Passwords | scrypt (N=32768, r=8, p=1, 16-byte salt) with constant-time compare. Policy: 10+ chars, not trivial. Never stored or logged in plaintext. |
| Sessions | 32-byte random token in an `HttpOnly`, `SameSite=Lax` cookie (`Secure` in production). Only its SHA-256 is stored. 7-day expiry. Validated against the DB on every admin page, action and API call. Logout and "sign out everywhere" delete the rows. |
| First admin / reset | `/admin/setup` works only while `ADMIN_SETUP_TOKEN` (≥16 chars) is set on the server, and the token is compared in constant time. There is no default password and no email dependency. The dashboard warns while the token is still set. |
| Brute force | 5 failed logins per email or 20 per IP per 15 minutes trigger a lockout. Setup attempts are rate-limited too. A dummy hash prevents user enumeration by timing. |
| CSRF | Server actions use Next.js's built-in Origin/Host check. Mutating route handlers (upload, replace, delete, restore) require a same-origin `Origin`/`Referer`. The cookie is `SameSite=Lax`. |
| Authorization | Middleware blocks `/admin*` and `/api/admin*` without a cookie. Every page, server action (`adminAction`) and API handler validates the session. Owner-only: user management and backup download/restore. |
| Input / output | Every action validates and bounds input. Rich text is sanitized on save **and** render. Links are allow-listed (`/`, `#`, `https://`, `mailto:`, `tel:`, "whatsapp"). JSON-LD escapes `<`. Theme CSS is built from allow-listed tokens only. |
| Uploads | Content sniffing, size limits, re-encoding, no SVG, `nosniff` + sandbox CSP on media. |
| Errors | Unexpected errors are logged server-side. The browser receives a generic message, with no SQL or stack traces. |
| Headers | `X-Frame-Options: SAMEORIGIN`, `frame-ancestors 'self'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, no `X-Powered-By`. Admin pages are `noindex` and `no-store`. |
| Secrets | Only in server environment variables (`.env.example` lists names only). Nothing secret uses `NEXT_PUBLIC_`. |

## 8. SEO

- **Per page / article / product / sub-brand:** SEO title, meta description, canonical (validated: same-site path or https URL), Open Graph title/description/image, and noindex.
- **Dynamic `sitemap.xml`:** published and indexable content only. Excludes drafts, noindex and disabled lines.
- **`robots.txt`:** blocks `/admin`, `/api/` and `/go/`.
- **JSON-LD:**
  - Organization/FoodEstablishment (from Site Settings)
  - Product with Offer when a price is set
  - BlogPosting
  - BreadcrumbList
  - FAQPage
- **Correct status codes:** 404 for missing or draft content, 301/302 for redirects.

## 9. Backups

The app-level backup (`lib/backup.ts`) is one `.json.gz` file. It contains all content tables, media bytes (or `MEDIA_ROOT` files) and admin accounts. Sessions are excluded.

| Way | Who / when |
| --- | --- |
| Admin download / restore | Owner only. Restore is a single transaction: all or nothing. |
| CLI | `pnpm backup`, `pnpm restore` |
| Scheduled | Hostinger Cron → `POST /api/backup/cron` with `x-backup-token` writes to `BACKUP_DIR` and keeps N files |

Hostinger's own daily/weekly backups and phpMyAdmin export are additional layers. See `DAMA_DATABASE_AND_BACKUP_GUIDE.md`.

## 10. Hosting decision

Target: **Hostinger Business Web Hosting or Cloud plan, "Node.js Web App"** (Managed Node.js).

- **Supported:** Next.js server mode (SSR, API and dynamic routes), MySQL, cron jobs, GitHub deployment, environment variables and Node 20/22.
- **Known limitation:** Hostinger overwrites deployed app folders on every deploy and documents that manual file changes there do not persist. It does not document a persistent writable folder for Node apps. Mitigation: media is stored in MySQL by default, so the media library survives every redeploy without relying on undocumented filesystem behavior (tested: rebuild + restart keeps byte-identical media).
- **Other limits to respect:**
  - 120 s request timeout: large backups should use the CLI or phpMyAdmin.
  - No always-running background workers: scheduled tasks use Cron.
  - Process limits are shared across sites on the plan.

**When to recommend a VPS instead (KVM 1/2):**

- the media library grows beyond a few GB;
- you need background workers, WebSockets or custom server software;
- Managed Node.js turns out not to install `sharp`'s prebuilt binary, or the database connection from the app fails.

On a VPS, use `MEDIA_STORAGE=filesystem` with `MEDIA_ROOT` on persistent disk, `node .next/standalone/server.js` behind Nginx with PM2/systemd, and Let's Encrypt.
