# DAMA KITCHEN — Analytics & Measurement Setup

## Status

- **Integration:** built and safe. Everything is driven by **server environment variables** read at request time, so no rebuild is needed.
- **Without IDs:** no third-party script loads, events are no-ops, and the site works normally.
- **No IDs were invented.** All are **required from the owner** (see below).
- **Testing:** verified locally with a test `GA4_ID` and the Google library stubbed. The dataLayer received `page_view`, `view_item`, `click_whatsapp`, `click_marketplace` (shopee), `view_item_list` and `view_corporate`, plus `generate_lead` after a stored inquiry (acceptance suite). UTM first-touch was stored. Live data in GA4/GTM is **POST-LAUNCH VALIDATION**.

## Environment variables

| Variable | Example | Effect |
| --- | --- | --- |
| `GTM_ID` | `GTM-ABC1234` | Loads Google Tag Manager. **Recommended:** configure GA4 inside GTM. |
| `GA4_ID` | `G-XXXXXXXXXX` | Loads GA4 directly. Used **only if `GTM_ID` is not set** (prevents double counting). |
| `CLARITY_ID` | `abcd1234ef` | Microsoft Clarity (optional, heatmaps) |
| `GOOGLE_SITE_VERIFICATION` | token from Search Console | `<meta name="google-site-verification">` |
| `BING_SITE_VERIFICATION` | token from Bing Webmaster | `<meta name="msvalidate.01">` |

IDs are validated by format and ignored if malformed. **Set analytics IDs on production only**, not on staging.

## Events (GA4 naming)

| Event | When | Parameters (no personal data) |
| --- | --- | --- |
| `page_view` | First load + every client navigation (automatic GA4 page_view is off, so no duplicates) | page_path, page_location, page_title |
| `view_item_list` | `/menu` | item_list_name, items |
| `select_item` | Click on a product name in a card | item_name, item_list_name |
| `view_item` | Product page | item_id, item_name, item_brand, item_category, price/currency (only when set) |
| `click_whatsapp` | Any link to wa.me, whatsapp.com or `/go/whatsapp` | link_text, item_name, page_path |
| `click_marketplace` | Links to Shopee, TikTok, GoFood, Grab, Tokopedia | marketplace, link_text, item_name, page_path |
| `form_start` | First input in an inquiry form | form_name (catering / gifting / corporate) |
| `generate_lead` | Inquiry **stored successfully** in the CMS | form_name |
| `view_catering` / `view_gifting` / `view_corporate` | Service pages | — |

These are **interactions, not sales**:

| Stage | Where it is tracked |
| --- | --- |
| CTA click | `click_*` events |
| Inquiry submission | `generate_lead`, plus the record in Admin → Permintaan masuk |
| Qualified lead / quotation / confirmed order | Status in Admin → Permintaan masuk: `contacted` → `quoted` → `won` / `lost` |
| Revenue | Not tracked on the website (orders close in WhatsApp or marketplaces) |

## Attribution (UTM)

- **First touch.** On first visit the browser stores `utm_source/medium/campaign/term/content`, `gclid`, the referrer host and the landing page. Stored in localStorage and never overwritten.
- **On inquiries.** This attribution is saved with each inquiry, visible in Admin → Permintaan masuk.
- **Privacy.** No names, phone numbers or messages are ever sent to analytics.

## Setup steps (owner / agency)

1. **GA4:** create a property (timezone Asia/Jakarta, currency IDR) and a Web data stream for the production domain.
2. **GTM:**
   1. Create a container.
   2. Add a *Google tag* with the GA4 measurement ID. Disable "send page view on load", because the site sends `page_view` itself.
   3. Add a GA4 Event tag triggered on *Custom Event* matching `^(page_view|view_item_list|select_item|view_item|click_whatsapp|click_marketplace|form_start|generate_lead|view_catering|view_gifting|view_corporate)$`. Event name `{{Event}}`; pass parameters via Data Layer Variables.
   4. Publish the container.
3. Set `GTM_ID` on Hostinger and restart. **Or** skip GTM and set `GA4_ID`.
4. In GA4 → Admin → Events, mark `generate_lead` (and optionally `click_whatsapp`) as **key events**.
5. **Search Console:** add a Domain property, preferably verified by DNS TXT, or use `GOOGLE_SITE_VERIFICATION`. Submit `https://<domain>/sitemap.xml`.
6. **Bing Webmaster Tools:** import from Search Console, or set `BING_SITE_VERIFICATION`. Submit the sitemap.
7. **Microsoft Clarity (optional):** create a project and set `CLARITY_ID`. Mask form inputs; Clarity masks them by default.

## Privacy note

- **Consent.** Analytics cookies are set only when IDs are configured. A consent banner is **not** implemented. Decide with legal advice under Indonesia's PDP Law (UU 27/2022) whether one is required; GTM consent mode can be added then.
- **Leads.** Inquiry data (name, WhatsApp number, company) is stored in the CMS database. The admin can delete it, and it is included in backups.
