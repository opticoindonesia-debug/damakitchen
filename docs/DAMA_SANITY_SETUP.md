# DAMA KITCHEN — Sanity Setup Status

## Decision: Sanity is not used. The self-hosted CMS replaces it.

The brief asks to inspect the Sanity configuration and activate it if practical. The inspection found:

- **No Sanity project, schema, Studio, credentials or dependency** in the codebase. All were removed in the previous phase, when the owner required: "No Sanity, no hosted CMS, no paid third-party DB/media/auth … everything hosted on DAMA's Hostinger account."
- A **working self-hosted CMS** at `/admin` (MySQL/MariaDB on Hostinger) already gives editors everything this brief asks of a CMS:
  - draft/published states, preview and validation;
  - media management and per-item SEO.

  It is covered by an automated acceptance suite (23/23).

Re-introducing Sanity would duplicate a working system, add a third-party dependency the owner rejected, and need credentials that don't exist. Per the brief's "CMS fallback rule" and "preserve what works", **no Sanity integration was created** and no fake one exists.

## How the brief's content types map to the CMS

| Brief content type | Implemented as | Notes |
| --- | --- | --- |
| A. Brand | `sub_brands` table (Admin → Sub-brand) + the Organization in Site Settings | role/lead, marker colour, hero image, channels, FAQ, cross-sell, extra sections, SEO, enabled switch |
| B. Product | `products` (Admin → Produk & harga) | name, slug, sub-brand, category, short and full description, **serving/weight, ingredients, storage, preparation** (new), price + note, availability, photo + gallery, order links (marketplace), WhatsApp CTA from the line's channels, SEO. Related articles come from the article side. |
| C. Service | Built-in pages `/katering`, `/hadiah`, `/corporate` (page builder) + Service JSON-LD | Coverage area and minimum order are **not** fields. They are written in page copy only once verified. |
| D. Article | `articles` (Admin → Catatan Dapur) | title, slug, category, tags, excerpt, **short answer**, rich body, author (text), **sources**, published + modified dates, featured image, related articles, **related products**, SEO, draft/publish |
| E. FAQ | `faqs` table (general) + each sub-brand's FAQ + page-builder FAQ sections | aggregated on `/faq` |
| F. Location | **Deferred.** There is no verified per-location data. The service area is a Site Settings field. | |
| G. Author | Text field on articles | Author profiles are deferred (low value until there are several authors) |
| H. Site Settings | `settings` (Admin → Pengaturan situs) | name, logo(s), default SEO, socials, contact, WhatsApp, marketplace links, default OG image, organization description, AI-training crawler switch |

**Validation.** Empty products or incomplete articles cannot be published. Publishing an article requires a body. Invalid links and URLs are rejected with a clear message.

## If Sanity is ever wanted again

This needs an explicit owner decision because it reverses the self-hosting requirement. Steps:

1. Create a project at sanity.io/manage. Note the project ID and dataset, and an API token (Editor role).
2. Add schemas mirroring the table above.
3. Write a one-time export from MySQL. `lib/backup.ts` already produces the full content as JSON.
4. Swap the read layer in `lib/cms/index.ts`. Every getter keeps the same return types, so the pages don't change.

Environment variables that would then be needed: `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN` (server only).
