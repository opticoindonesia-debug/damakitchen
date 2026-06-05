# DAMA KITCHEN

The official brand website for **DAMA KITCHEN** — masakan Minang otentik yang membuat _taraso disayang_.

A brand-led marketing + discovery site: it tells DAMA's story, showcases the five
sub-brands, and routes buyers to existing commerce channels (Shopee, TikTok Shop,
WhatsApp, GoFood/Grab). It is **not** a cart/checkout — there is no payment, inventory,
or order database.

> The single test for every decision: _"Does this make someone taraso disayang?"_
> If not, it isn't DAMA. **The restraint is the brand.**

---

## Tech stack

- **Next.js 14** (App Router) + **TypeScript** (strict)
- **Tailwind CSS** — full brand token theme in `tailwind.config.ts`
- **next/font** — Playfair Display (display/quotes) + Poppins (body/UI)
- **framer-motion** — calm entrances only, respects `prefers-reduced-motion`
- **pnpm** · ESLint + Prettier (with Tailwind class sorting)
- Deploy target: **Vercel** (static + edge; no server secrets required for v1)

## Getting started

```bash
pnpm install
cp .env.example .env.local   # optional — placeholders work in dev
pnpm dev                     # http://localhost:3000
```

Other scripts:

```bash
pnpm build     # production build (all routes static except OG images + /api/inquiry)
pnpm lint      # ESLint
pnpm format    # Prettier
```

## Project structure

```
app/                 Routes (home, cerita, menu, 5 sub-brands, katering, hadiah,
                     pesan, kontak, catatan-dapur, api/inquiry, sitemap, robots,
                     opengraph-image, icon)
components/          Reusable, typed UI (see Component library below)
components/icons/    DAMA line icons (2px stroke, 24×24)
content/             Typed content layer — the CMS-replaceable data source
lib/                 WhatsApp link builder, SEO helper, email adapter, utils
messages/id.json     i18n-ready strings (ships `id` only)
public/patterns/     Motif SVG placeholders (TODO: real assets)
public/images/       Photography placeholders, structured by subject
```

## Editing content

All copy and catalog data live under `content/` as typed TS — no CMS yet, but the
shape is CMS-ready. Common edits:

| Want to change… | Edit |
| --- | --- |
| Sub-brand name, emotion, lead message, FAQs, channels | `content/subbrands.ts` |
| Menu items / product blurbs | `content/products.ts` |
| Channel URLs, WhatsApp number, socials, coverage | `content/channels.ts` (or env) |
| Brand pillars / values / story / founder quote | `content/pillars.ts`, `values.ts`, `story.ts` |
| Nav, taglines, seasonal gifting banner | `content/site.ts` |
| WhatsApp message templates | `lib/whatsapp.ts` |

> **Voice guardrails (§5):** no superlatives, no caps-lock urgency, no fake discounts,
> at most one emoji, customers have names. These apply to outbound WhatsApp templates too.

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
- [ ] Photography library → `public/images/{food,ingredients,product,process,lifestyle}/` and swap `<Placeholder>` for `next/image`
- [ ] Founder portrait → used on `/` and `/cerita`

**Live data (env or content)**

- [ ] WhatsApp business number — `NEXT_PUBLIC_WHATSAPP_NUMBER`
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
