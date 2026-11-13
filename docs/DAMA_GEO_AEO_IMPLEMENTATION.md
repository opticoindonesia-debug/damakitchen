# DAMA KITCHEN — GEO / AEO & AI Retrievability

**Principle:** clear, accurate, crawlable information plus a consistent entity graph. No speculative "AI ranking" tricks. Nothing here guarantees inclusion or recommendation by any AI system. That can only be observed after launch (see §7).

## 1. Entity structure (Schema.org JSON-LD)

One site-wide `@graph` is rendered in the public layout (`components/JsonLd.tsx → SiteJsonLd`). Stable IDs on the production domain:

| Entity | `@id` | Key facts (only what exists in the admin) |
| --- | --- | --- |
| Organization: DAMA KITCHEN | `{SITE}/#organization` | name, url, description (Site Settings → "Siapa DAMA KITCHEN"), slogan "Taraso Disayang", logo/image if uploaded, `knowsAbout`: Masakan Minang, ContactPoint (WhatsApp), email and `sameAs` **only if filled in**, `brand` → each sub-brand |
| WebSite | `{SITE}/#website` | name, url, `inLanguage: id-ID`, publisher → Organization |
| Brand ×N (enabled sub-brands) | `{SITE}/<slug>#brand` | name, description (lead), url, hero image if uploaded |

Page-level entities **reference** these IDs and never redefine them:

- **Product** (`/menu/<slug>`):
  - `brand` → the sub-brand `#brand`; `manufacturer` → Organization;
  - category; image only if uploaded;
  - **Offer only when a price is set** (IDR plus availability mapped from the admin field).
  - Never: rating, review, SKU or stock count.
- **BlogPosting:** publisher → Organization, `isPartOf` → WebSite, author (person or Organization), `datePublished` and `dateModified`, `about` → the products discussed, `citation` → the article's sources.
- **Service** (`/katering`, `/hadiah`, `/corporate`):
  - `provider` → Organization; `brand` → the relevant sub-brand(s).
  - **No `areaServed`, price or capacity is claimed** in structured data.
- **BreadcrumbList** on products, articles and `/faq`. **FAQPage** on `/faq`, on FAQ sections, and on the FAQ data block (visible Q&A only).

**Removed:** `FoodEstablishment`. It is a LocalBusiness type and implies a visitable venue. DAMA has no published address, so the markup would be misleading.

**Never emitted:** legal name, address, geo coordinates, opening hours, founding date, ratings, reviews or awards. Add them only after they are verified, via Site Settings and a code change.

All JSON-LD is escaped (`<` → `<`). The QA crawl parses every block on every page: 0 errors.

## 2. Answer-friendly content (AEO)

- **`/faq` (new).** An answer-first hub built only from verified admin data:
  - "Apa itu DAMA KITCHEN?" uses the organization description.
  - "Apa arti Taraso Disayang?"
  - The lines and how they differ (each sub-brand's lead).
  - "Di mana DAMA melayani?" uses Site Settings → Area layanan.
  - "Bagaimana cara memesan?" uses the configured channels.
  - "Bagaimana perusahaan meminta penawaran?"
  - Every sub-brand FAQ and the general FAQ collection.

  Each question is a heading with a direct one-paragraph answer in visible HTML (no accordion), plus a link to the relevant page.
- **Articles (Catatan Dapur)** now have:
  - **Jawaban singkat:** a 1–3 sentence direct answer shown first;
  - **Sumber:** a list of references, https only;
  - **Produk terkait**, linked both ways;
  - a visible "Diperbarui" date.
- **Product pages** show serving/weight, ingredients, storage and preparation **only when the owner fills them in**, from a verified spec or SOP. They also show the line's FAQ and related articles.
- **Crawlability.** All important content is server-rendered HTML. The menu filter only filters already-rendered cards.

## 3. AI crawler policy (`/robots.txt`, production only)

| Crawler type | Examples | Policy |
| --- | --- | --- |
| Search engines | Googlebot, Bingbot | Allowed |
| AI search / answer retrieval | OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, Claude-SearchBot, Claude-User | Allowed (covered by `User-agent: *`) |
| AI **model training** | GPTBot, ClaudeBot, Google-Extended, CCBot, Applebot-Extended, meta-externalagent, Bytespider | **Allowed by default.** Owner switch: Pengaturan situs → Mesin pencari & asisten AI. When off, these get `Disallow: /`. |

- `/admin`, `/api/`, `/go/` are disallowed for everyone.
- **Rationale for the default:** the top business priority is AI visibility, so training access is allowed by default. It is a content-ownership choice for the owner and can be changed at any time without a rebuild.

## 4. `/llms.txt`

- **What it is.** A plain-text index ([llmstxt.org](https://llmstxt.org) format), generated live from published data.
- **What it contains:** the organization description, brand promise, service area, WhatsApp ordering, and links to about, FAQ, sub-brands (with leads), services, every published product (with blurb), articles and custom pages.
- **Correctness.** Only published, working URLs are listed.
- **On staging** it is sent with `X-Robots-Tag: noindex`.
- **Limits.** It is an informational convenience. There is no evidence it is a ranking or recommendation factor.

## 5. Brand knowledge checklist (where each answer lives)

| Question | Answered on |
| --- | --- |
| Who is DAMA KITCHEN? | `/faq`, `/cerita`, Organization JSON-LD, `llms.txt` |
| What is Taraso Disayang? | `/faq`, homepage, `/cerita` |
| Product categories / sub-brand differences | `/faq`, `/menu`, the sub-brand pages, Brand entities |
| Products available | `/menu`, `/menu/<slug>` (Product JSON-LD) |
| Services | `/katering`, `/hadiah`, `/corporate` (Service JSON-LD) |
| Where DAMA operates | Site Settings → Area layanan, shown on `/kontak` and `/faq` (default "Melayani area Jabodetabek." — confirm) |
| How to order | `/pesan`, `/faq`, WhatsApp buttons on every product |
| How companies request quotes | `/corporate` (form + WhatsApp) |

## 6. Not implemented (by design)

The brief marks these as future work (Priority C):

- vector database, RAG or chatbot;
- an automated knowledge-graph database;
- automated AI-mention tracking.

## 7. Post-launch validation (manual)

Monthly, ask ChatGPT Search, Perplexity, Gemini and Copilot:

- "katering Minang Jabodetabek"
- "hampers makanan Minang"
- "rendang frozen siap saji"
- "apa itu DAMA KITCHEN"

Record whether DAMA appears and whether the facts are correct. Use a simple sheet with columns: date, engine, query, mentioned (yes/no), accuracy notes, cited URL. Fix any inaccuracy at the source page.
