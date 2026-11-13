# DAMA KITCHEN — Migration Report (Sanity → self-hosted CMS)

Date: 2026-11-13 · Branch: `claude/elegant-hamilton-twBLg`

## 1. Summary

| Step | Status |
| --- | --- |
| Sanity code, packages, Studio, webhook, schemas, image helpers, seed scripts, env vars and docs removed | **Done.** Verified: 0 Sanity packages in `package.json` / `pnpm-lock.yaml`. Only the one-time importer remains, and it has no Sanity dependency. |
| Repository content imported into MySQL (automatic on first start) | **Done and tested** |
| Owner's **live Sanity edits** imported | **Action required.** Needs an export from the old Sanity project (see §4). The importer is built and tested on a synthetic export in the real format. |
| Existing content deleted | **No.** Nothing was deleted. The old Sanity project and the Vercel site are untouched. |

Note: the development sandbox could not reach `sanity.io`, so the content currently edited in the old Studio could not be read directly. Everything below that comes "from the repository" equals what the site renders when Sanity is not connected.

## 2. Migrated automatically (initial content)

On first start against an empty database, the CMS imports the content that previously lived in `/content/*.ts` and the page-builder layouts in `lib/seed/pages.ts` (formerly `sanity/seedPages.ts`).

| Content | Count | Notes |
| --- | --- | --- |
| Built-in pages (Beranda, Cerita, Menu, Katering & Acara, Hadiah, Di mana memesan, Kontak) | 7 pages, 27 sections | Published. Same layout and copy as the coded pages. |
| Sub-brands | 5 | LAMAK DAMA, WARISAN DAMA, DAMA KAPAU, TANDO MATO enabled. **HIDANG BASAMO kept disabled**, as before. Emotion, lead, about, how-to-order, channels, FAQs, cross-sell, marker colour and channel note are all imported. |
| Product categories | 5 | Derived from each line's format: Frozen siap panas, Hidangan warisan, Katering & acara, Besek & kotakan acara, Hampers & hadiah. |
| Products | 19 | Published. Name, blurb, line, info icons and placeholder style. WARISAN products marked *Pre-order*. Each now also has a detail page at `/menu/<slug>`. |
| Brand pillars / values | 4 / 5 | |
| Testimonials | 3 | Imported **visible** to keep the current site identical. They are placeholders (see §3). |
| Site settings | 1 | Name, tagline, description, WhatsApp **6281181207201**, email, socials, service area, channel URLs (GoFood & Grab **disabled**, as before), seasonal banner, sub-brand page labels. |
| Navigation & footer | 1 | Same menu items, "Pesan" CTA, footer columns and links. |
| Theme | 1 | **Brand palette per the project brief:** Deep Teal #1F4D4D, Terracotta #C65B3E, Blush Rose #E6C7C7, Gold #D9A441, Cream #F2E8D9, Deep Brown #4A2F22. Fonts Playfair Display + Poppins. |
| URLs | all | Every existing URL is unchanged. New URLs: `/menu/<product>`, `/admin`, `/media/<file>`. |

## 3. Needs manual verification

1. **Live Sanity content.** Run the export and import on staging (§4), then review every imported page and article in the admin and click **Terbitkan**.
2. **Palette shift.**
   - Changed versus the old code defaults: Gold #C39A3C → #D9A441, Cream #F7F1E3 → #F2E8D9, Brown #33231C → #4A2F22, Blush #E8C7C2 → #E6C7C7. Teal and Terracotta are unchanged.
   - These are the brief's values. Contrast checks pass: brown on cream ≈ 10:1.
   - Confirm visually on staging. Revert per colour in Admin → Tampilan (the **asli** link).
3. **Testimonials** (Rina, Pak Hendra, Sari) are fabricated placeholders. Replace them with real, consented testimonials or hide them before launch. The dashboard shows a reminder.
4. **Prices.** All 19 products have no price, as in the old code. Fill them in under Produk & harga if prices should be shown.
5. **Channel URLs.** Shopee and TikTok Shop point at generic homepages (`https://shopee.co.id/`, `https://www.tiktok.com/`). Set the real store URLs in Pengaturan situs → Kanal belanja.
6. **Contact handles.** The email `halo@damakitchen.id` and social handles `@damakitchen` were marked TODO in the old code. Confirm them in Pengaturan situs.
7. **Sanity drafts.** Unpublished drafts in the old Studio are **not** imported, by design. The import report lists them, so recreate any you still need.

## 4. How to migrate the live Sanity content

See `DAMA_HOSTINGER_DEPLOYMENT_GUIDE.md` §7. In short:

```bash
npx sanity@3 dataset export production sanity-export.tar.gz --project <PROJECT_ID>
DATABASE_URL="mysql://…staging…" pnpm import:sanity sanity-export.tar.gz          # dry run → report
DATABASE_URL="mysql://…staging…" pnpm import:sanity sanity-export.tar.gz --apply
```

What the importer does:

- **Site settings** → Site, Theme (colours), Navigation & Footer, written as **drafts**.
- **Sub-brands** → updated by slug: copy, marker colour, hero photo, extra sections.
- **Products** → updated or inserted by slug, including price and photo.
- **Pages** → built-in pages by ID (`page-<key>`), custom pages by slug, written as **drafts**:
  - Portable Text becomes HTML;
  - images are uploaded to the media library;
  - legacy single-block pages become a Teks section.
- **Journal posts** → articles, written as **drafts**. Body images are uploaded.
- **Testimonials, pillars, values** → inserted. The previous entries are hidden, not deleted.
- **A Markdown report** with four lists: migrated / needs verification / failed / assets needing replacement.

**Test result** (synthetic export with site settings, a sub-brand, a product, a 2-section page with an image and Portable Text, an article with heading, list and missing image, a draft, and a testimonial):

- all types migrated;
- images uploaded once and deduplicated;
- Portable Text converted;
- the draft reported, not imported;
- the missing image listed under "assets needing replacement";
- nothing deleted.

## 5. Failed

None in the repository migration. The live Sanity import has not been run yet (see §1).

## 6. Assets needing replacement (photography)

The repository contains **no real photographs**. Every image slot shows a warm placeholder: `public/images/*` holds only README files, and `public/logo` has no logo file, so the site uses the typeset logo. Upload real assets in Admin → Media and attach them:

| Asset | Where to attach |
| --- | --- |
| Homepage hero photo | Halaman → Beranda → Hero → Foto |
| Founder / story photo | Halaman → Cerita → Hero → Foto |
| Katering and Hadiah hero photos | Halaman → Katering / Hadiah → Hero |
| Product photos (19) | Produk & harga → each product → Foto utama (+ galeri) |
| Sub-brand hero photos (4 active + HIDANG) | Sub-brand → Foto hero |
| Logo, light logo, monogram (optional) | Pengaturan situs → Logo & ikon |
| Default share image 1200×630 (optional) | Pengaturan situs → Gambar bawaan saat dibagikan |

Any photos already uploaded in the old Sanity Studio are migrated by the importer in §4.
