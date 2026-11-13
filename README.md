# DAMA KITCHEN

The official brand website for **DAMA KITCHEN** — masakan Minang otentik yang membuat _taraso disayang_ —
with its own **self-hosted content management system** at `/admin`.

A brand-led marketing + discovery site: it tells DAMA's story, showcases the sub-brands
(LAMAK DAMA, WARISAN DAMA, HIDANG BASAMO, DAMA KAPAU, TANDO MATO) and routes buyers to existing
channels (WhatsApp, Shopee, TikTok Shop, GoFood/Grab). It is **not** a shop/checkout.

> The single test for every decision: _"Does this make someone taraso disayang?"_
> If not, it isn't DAMA. **The restraint is the brand.**

Everything runs on DAMA's own Hostinger account: no hosted CMS, no paid third-party database,
media, auth or deployment service.

---

## Documentation

| Document | For |
| --- | --- |
| [docs/DAMA_CMS_OWNER_MANUAL.md](docs/DAMA_CMS_OWNER_MANUAL.md) | **Pemilik** — panduan admin (Bahasa Indonesia) |
| [docs/DAMA_HOSTINGER_DEPLOYMENT_GUIDE.md](docs/DAMA_HOSTINGER_DEPLOYMENT_GUIDE.md) | Deploying to Hostinger (staging → production), rollback |
| [docs/DAMA_DATABASE_AND_BACKUP_GUIDE.md](docs/DAMA_DATABASE_AND_BACKUP_GUIDE.md) | Database, migrations, backups & tested restore procedure |
| [docs/DAMA_CMS_ARCHITECTURE.md](docs/DAMA_CMS_ARCHITECTURE.md) | Architecture, schema, security model, decisions |
| [docs/DAMA_MIGRATION_REPORT.md](docs/DAMA_MIGRATION_REPORT.md) | Sanity → self-hosted migration report |
| [docs/DAMA_LAUNCH_CHECKLIST.md](docs/DAMA_LAUNCH_CHECKLIST.md) | Go-live checklist, readiness status, acceptance results |
| [docs/DAMA_TECHNICAL_AUDIT.md](docs/DAMA_TECHNICAL_AUDIT.md) | Audit findings (SEO / GEO / conversion pass) |
| [docs/DAMA_IMPLEMENTATION_REPORT.md](docs/DAMA_IMPLEMENTATION_REPORT.md) | What was implemented, simplified, deferred |
| [docs/DAMA_SEO_IMPLEMENTATION.md](docs/DAMA_SEO_IMPLEMENTATION.md) | Metadata, canonicals, sitemap, robots, staging protection |
| [docs/DAMA_GEO_AEO_IMPLEMENTATION.md](docs/DAMA_GEO_AEO_IMPLEMENTATION.md) | Entity graph, structured data, /faq, llms.txt, AI crawler policy |
| [docs/DAMA_ANALYTICS_SETUP.md](docs/DAMA_ANALYTICS_SETUP.md) | GA4/GTM/Clarity, events, Search Console, Bing |
| [docs/DAMA_CONTENT_BACKLOG.md](docs/DAMA_CONTENT_BACKLOG.md) | Catatan Dapur topics and content gaps |
| [docs/DAMA_SANITY_SETUP.md](docs/DAMA_SANITY_SETUP.md) | Why Sanity is not used; content-type mapping |
| [.env.example](.env.example) | Every environment variable |

## Tech stack

- **Next.js 14** (App Router, server rendering, `output: standalone`) + **TypeScript** (strict)
- **MySQL / MariaDB** (Hostinger) via **Drizzle ORM** + `mysql2`; SQL migrations embedded in the build
- **Admin CMS** in the same app (`/admin`): scrypt password hashing, database sessions, rate limiting
- **Media** self-hosted (stored in MySQL by default, or a persistent folder), optimized with **sharp**
- **Tailwind CSS** with runtime design tokens (colors, fonts, radius, spacing) editable in the admin
- **TipTap** rich-text editor (sanitized HTML), **dnd-kit** drag & drop page builder
- pnpm · ESLint · Prettier

## Getting started (local)

Requires Node 20+ and a local MySQL 8 / MariaDB 10.6+.

```bash
pnpm install
cp .env.example .env.local      # set DATABASE_URL + ADMIN_SETUP_TOKEN
pnpm dev                        # http://localhost:3000 (DB is migrated + seeded on first request)
# open http://localhost:3000/admin/setup to create the owner account
```

Scripts:

```bash
pnpm build            # production build (no database needed at build time)
pnpm start            # start the built app
pnpm lint / pnpm typecheck
pnpm db:generate      # after editing lib/db/schema.ts: new SQL migration + embed it
pnpm db:setup         # apply migrations + initial content to DATABASE_URL
pnpm backup [file]    # full backup (.json.gz)
pnpm restore <file> --yes [--with-users]
pnpm import:sanity <sanity-export.tar.gz> [--apply]   # one-time import of old Sanity content
```

## Project structure

```
app/(site)/          Public website (server-rendered from published DB content)
app/admin/           Admin CMS (login, setup, dashboard and all modules)
app/api/admin/       Authenticated APIs (media upload, backup, preview)
app/media/[key]/     Serves self-hosted media (responsive variants via ?w=)
components/          Public UI + page-builder renderers (components/builder)
components/admin/    Admin UI kit, page builder editor, media library, rich text
lib/db/              Drizzle schema, connection pool, migration runner
lib/cms/             Public data layer (published content, preview for admins)
lib/sections/        Page-builder section definitions + server validation
lib/auth/            Passwords, sessions, guards, rate limiting
lib/media/, lib/backup.ts, lib/seed/   Media storage, backup/restore, initial content
content/             Original content (used once to seed the database)
drizzle/             Generated SQL migrations
scripts/             CLI: db setup, backup, restore, Sanity import
```

## Brand system notes

- **Colors** are tokens only (`tailwind.config.ts`) — no stray hex in components.
  Usage reads as a calm cream canvas (~60%) with teal structure (20%) and warm
  terracotta/gold accents.
- **Sub-brand markers** are distinct tokens (`marker.lamak`…`marker.tando`). Each
  sub-brand page sets its marker as the `--accent` CSS variable; everything else
  stays in the core palette.
- **Motifs**: max one per composition, opacity-capped in `<PatternBand>` (≤0.12).
- **Motion**: fade + 14px slide-up, ~500ms, staggered; disabled under reduced-motion.

### Color contrast (CI-friendly note · §3.3)

Body and interactive text on cream **must** be teal or brown — never gold or blush.
Approved AA pairings used in this site:

| Foreground / Background | Ratio | Use |
| --- | --- | --- |
| Teal `#1F4D4D` on Cream `#F7F1E3` | ~9.6:1 | body, headings |
| Ink `#33231C` on Cream | ~12:1 | body |
| Cream on Teal | ~9.6:1 | footer, dark sections |
| Cream on Terracotta `#C65B3E` | ~4.6:1 | primary buttons |
| **Terracotta `#C65B3E` on Cream** | **~3.8:1** | large text / icons **only** |
| **Terracotta-deep `#A8472C` on Cream** | **~5.2:1** | small label text on cream |

Base terracotta is reserved for large text (≥24px / ≥19px bold) and icons. Small
terracotta text on cream uses the `terracotta-deep` token to clear AA. Gold and blush
are surfaces/accents — never body text on cream.

## Component library

`Logo`, `Navbar`, `Footer`, `Section`, `Button`, `ChannelButton`, `SubBrandCard`,
`SubBrandPage`, `ProductCard`, `PillarRow`, `QuoteBlock`, `DiamondDivider`,
`PatternBand`, `ImageWithScrim` / `Placeholder`, `InfoIconRow` (+ icon set),
`FAQAccordion`, `InquiryForm` (catering + gifting), `Reveal` (motion), `JsonLd`.
All are keyboard-operable with visible teal focus rings and no color-only state
signaling.

## Commerce integration

No checkout. `content/channels.ts` is the single config object for all channel
links. WhatsApp uses `https://wa.me/<E164>?text=<encoded>` deep links built in
`lib/whatsapp.ts`. Inquiry forms (`/katering`, `/hadiah`) build a prefilled WA
quotation and POST to `/api/inquiry`, which can additionally fire an email via the
pluggable adapter in `lib/email.ts`.

---

## Pending real assets (TODO checklist · §15)

Everything below ships as a clearly-marked placeholder until real assets land.

**Brand assets**

- [ ] Official logo SVGs (primary, stacked, monogram) → `components/Logo.tsx`, `public/logo/`
- [ ] The 5 motif files (Songket Teal, Floral Blush, Geometric Gold, Bunga Terracotta, Leaf/Daun) → `public/patterns/`
- [ ] Photography library → drop files under `public/images/...` and set `image` / `heroImage` / `media` paths (see **Adding photography**). The `next/image` swap is already wired — placeholders disappear automatically once a path is set.
- [ ] Founder portrait → used on `/` and `/cerita`

**Live data (env or content)**

- [x] WhatsApp business number — set (`+6281181207201`); overridable via `NEXT_PUBLIC_WHATSAPP_NUMBER`
- [ ] Shopee / TikTok Shop / GoFood / Grab store URLs — `NEXT_PUBLIC_*_URL`
- [ ] Social handles + contact email — `content/channels.ts` / `NEXT_PUBLIC_CONTACT_EMAIL`
- [ ] Service-area coverage copy — `content/channels.ts`
- [ ] Real prices (currently `null`, marked TODO) — `content/products.ts`
- [ ] Real, consented testimonials — `content/testimonials.ts`

**Decisions to confirm (§15)**

- [ ] Email adapter: wire Resend (or similar) in `lib/email.ts` + set `INQUIRY_EMAIL_*`, or leave WhatsApp-only
- [ ] Production domain — `NEXT_PUBLIC_SITE_URL`
- [ ] Privacy-friendly analytics (Plausible/Umami) — none added yet, by design
- [ ] Lock the sub-brand name globally: this build uses **HIDANG BASAMO** (newer source)

## Environment variables

See `.env.example`. None are required for the WhatsApp routing path; sensible
placeholders keep the site fully functional in development.

## Accessibility & performance

- WCAG 2.1 AA: semantic landmarks, skip-link, logical headings, focus-visible rings,
  ARIA on the accordion/drawer/forms, descriptive ID alt text, reduced-motion honored.
- Fonts via `next/font` (no FOIT/CLS); placeholders reserve aspect ratios (no CLS).
- Most pages are static RSC with minimal client JS (Navbar, menu filter, forms, motion).
- Targets: Lighthouse mobile ≥ 90 across all four categories, LCP < 2.5s. Run Lighthouse
  against a production build (`pnpm build && pnpm start`) once real hero imagery is in.
