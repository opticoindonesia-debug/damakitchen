import 'server-only';
import { createHash } from 'node:crypto';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { draftMode } from 'next/headers';
import { and, asc, desc, eq, isNotNull, or } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  articleCategories,
  articles,
  brandItems,
  faqs,
  pages,
  productCategories,
  products,
  redirects,
  settings,
  subBrands,
  tags,
  articleTags,
  testimonials,
  type ImageRef,
  type SeoFields,
} from '@/lib/db/schema';
import { ensureReady } from '@/lib/bootstrap';
import { getSessionUser } from '@/lib/auth/session';
import {
  DEFAULT_NAVIGATION,
  DEFAULT_SITE,
  DEFAULT_THEME,
  cleanNavigation,
  cleanSiteSettings,
  cleanTheme,
  type NavigationData,
  type SiteSettingsData,
  type ThemeData,
} from '@/lib/settings';
import { BUILT_IN_PAGES, RESERVED_SLUGS, type BuiltInPageKey } from '@/lib/pages';
import { subBrands as staticSubBrandMap, type SubBrand, type SubBrandSlug } from '@/content/subbrands';
import type { Product } from '@/content/products';
import type { Pillar } from '@/content/pillars';
import type { BrandValue } from '@/content/values';
import type { Testimonial } from '@/content/testimonials';

/**
 * Public content access layer (MySQL). Every getter returns PUBLISHED
 * content only. When a signed-in admin enables preview (draft mode), the
 * same getters return working copies instead — never for anonymous visitors.
 *
 * Published reads are cached under the 'cms' tag and invalidated on every
 * publish/save in the admin (revalidateTag), so changes are live instantly.
 */

const TAG = 'cms';

/**
 * Cache entries are scoped to the database (so two databases never share
 * cached content) and expire after 5 minutes as a safety net for changes made
 * outside the admin (CLI restore, import, phpMyAdmin). Admin saves invalidate
 * the 'cms' tag immediately.
 */
const DB_SCOPE = createHash('sha256').update(process.env.DATABASE_URL ?? 'none').digest('hex').slice(0, 12);
const CACHE_OPTS = { tags: [TAG], revalidate: 300 };

/** True only for a signed-in admin who switched preview on. */
export const isPreview = cache(async (): Promise<boolean> => {
  if (!draftMode().isEnabled) return false;
  return Boolean(await getSessionUser());
});

/**
 * Wraps a loader: published reads go through the data cache; preview reads
 * bypass it. The loader receives `preview` explicitly (never reads cookies
 * inside the cache).
 */
function cached<A extends unknown[], R>(name: string, fn: (preview: boolean, ...args: A) => Promise<R>) {
  const c = unstable_cache(
    async (...args: A) => {
      await ensureReady();
      return fn(false, ...args);
    },
    ['dama', DB_SCOPE, name],
    CACHE_OPTS,
  );
  return async (...args: A): Promise<R> => {
    if (await isPreview()) {
      await ensureReady();
      return fn(true, ...args);
    }
    return c(...args);
  };
}

const imgUrl = (i: ImageRef | null | undefined) => (i && i.url ? i.url : undefined);

// ── Settings ──────────────────────────────────────────────────
async function loadSetting(key: string, preview: boolean): Promise<Record<string, unknown> | null> {
  const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  if (!row) return null;
  return (preview ? row.draft : row.published) ?? row.published ?? null;
}

export interface PublicSettings {
  site: SiteSettingsData;
  theme: ThemeData;
  nav: NavigationData;
}

const settingsPublished = unstable_cache(
  async (): Promise<PublicSettings> => {
    await ensureReady();
    return buildSettings(false);
  },
  ['dama', DB_SCOPE, 'settings'],
  CACHE_OPTS,
);

async function buildSettings(preview: boolean): Promise<PublicSettings> {
  const [site, theme, nav] = await Promise.all([
    loadSetting('site', preview),
    loadSetting('theme', preview),
    loadSetting('navigation', preview),
  ]);
  return {
    site: site ? cleanSiteSettings({ ...DEFAULT_SITE, ...site }).data : DEFAULT_SITE,
    theme: theme ? cleanTheme(theme) : DEFAULT_THEME,
    nav: nav ? cleanNavigation(nav).data : DEFAULT_NAVIGATION,
  };
}

/** Site, theme and navigation settings (request-deduplicated). */
export const getSettings = cache(async (): Promise<PublicSettings> => {
  if (await isPreview()) {
    await ensureReady();
    return buildSettings(true);
  }
  return settingsPublished();
});

// ── Sub-brands ────────────────────────────────────────────────
type SubBrandRow = typeof subBrands.$inferSelect;

function toSubBrand(r: SubBrandRow): SubBrand {
  const base = staticSubBrandMap[r.slug as SubBrandSlug];
  return {
    slug: r.slug as SubBrandSlug,
    name: r.name,
    shortName: r.shortName,
    emotion: r.emotion,
    lead: r.lead,
    about: r.about,
    howToOrder: r.howToOrder,
    marker: base?.marker ?? 'lamak',
    markerHex: r.markerHex,
    channels: r.channels as SubBrand['channels'],
    faqs: r.faqs ?? [],
    crossSell: (r.crossSell ?? []) as SubBrandSlug[],
    heroImage: imgUrl(r.heroImage),
    heroAlt: r.heroImage?.alt,
    channelNote: r.channelNote ?? undefined,
    seo: r.seo ?? {},
  } as SubBrand;
}

const loadSubBrands = cached('subBrands', async () => {
  const rows = await db.select().from(subBrands).where(eq(subBrands.enabled, true)).orderBy(asc(subBrands.sortOrder), asc(subBrands.id));
  return rows.map(toSubBrand);
});

export const getSubBrands = cache(() => loadSubBrands());

export async function getSubBrand(slug: string): Promise<SubBrand | undefined> {
  return (await getSubBrands()).find((s) => s.slug === slug);
}

export const getSubBrandExtras = cached('subBrandExtras', async (_p, slug: string) => {
  const [r] = await db
    .select({ extra: subBrands.extraSections })
    .from(subBrands)
    .where(and(eq(subBrands.slug, slug), eq(subBrands.enabled, true)))
    .limit(1);
  return { extraSections: ((r?.extra ?? []) as Section[]).filter(Boolean) };
});

// ── Products ──────────────────────────────────────────────────
export interface PublicProduct extends Product {
  slug: string;
  description?: string;
  priceNote?: string;
  availability: 'available' | 'preorder' | 'seasonal' | 'unavailable';
  gallery: ImageRef[];
  imageAlt?: string;
  category?: { slug: string; name: string };
  orderLinks: { label: string; url: string }[];
  ingredients?: string;
  serving?: string;
  storage?: string;
  preparation?: string;
  seo: SeoFields;
  updatedAt?: string;
}

const loadProducts = cached('products', async (): Promise<PublicProduct[]> => {
  const rows = await db
    .select({ p: products, sb: subBrands.slug, sbEnabled: subBrands.enabled, catSlug: productCategories.slug, catName: productCategories.name })
    .from(products)
    .leftJoin(subBrands, eq(subBrands.id, products.subBrandId))
    .leftJoin(productCategories, eq(productCategories.id, products.categoryId))
    .where(eq(products.status, 'published'))
    .orderBy(asc(products.sortOrder), asc(products.id));
  return rows
    .filter((r) => r.sbEnabled !== false)
    .map(({ p, sb, catSlug, catName }) => ({
      id: p.slug,
      slug: p.slug,
      name: p.name,
      blurb: p.blurb,
      description: p.description ?? undefined,
      subBrand: (sb ?? '') as SubBrandSlug,
      info: (p.info ?? []) as Product['info'],
      price: p.price,
      priceNote: p.priceNote ?? undefined,
      availability: p.availability,
      imageCategory: (p.imageCategory as Product['imageCategory']) ?? 'food',
      image: imgUrl(p.image),
      imageAlt: p.image?.alt,
      gallery: p.gallery ?? [],
      category: catSlug && catName ? { slug: catSlug, name: catName } : undefined,
      orderLinks: p.orderLinks ?? [],
      ingredients: p.ingredients ?? undefined,
      serving: p.serving ?? undefined,
      storage: p.storage ?? undefined,
      preparation: p.preparation ?? undefined,
      seo: p.seo ?? {},
      updatedAt: p.updatedAt?.toISOString(),
    }));
});

export const getProducts = cache(() => loadProducts());

export async function getProductsBySubBrand(slug: string): Promise<PublicProduct[]> {
  return (await getProducts()).filter((p) => p.subBrand === slug);
}

export async function getProduct(slug: string): Promise<PublicProduct | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

// ── Small collections ─────────────────────────────────────────
export const getTestimonials = cached('testimonials', async (): Promise<Testimonial[]> =>
  db
    .select({ name: testimonials.name, context: testimonials.context, quote: testimonials.quote })
    .from(testimonials)
    .where(eq(testimonials.visible, true))
    .orderBy(asc(testimonials.sortOrder), asc(testimonials.id)),
);

const loadBrandItems = cached('brandItems', async () =>
  db.select().from(brandItems).where(eq(brandItems.visible, true)).orderBy(asc(brandItems.sortOrder), asc(brandItems.id)),
);

export async function getPillars(): Promise<Pillar[]> {
  return (await loadBrandItems())
    .filter((i) => i.kind === 'pillar')
    .map((i) => ({ title: i.title, desc: i.body, icon: (i.icon ?? 'recipe') as Pillar['icon'] }));
}

export async function getValues(): Promise<BrandValue[]> {
  return (await loadBrandItems()).filter((i) => i.kind === 'value').map((i) => ({ title: i.title, desc: i.body }));
}

export const getFaqs = cached('faqs', async () =>
  db
    .select({ q: faqs.question, a: faqs.answer, group: faqs.groupKey })
    .from(faqs)
    .where(eq(faqs.visible, true))
    .orderBy(asc(faqs.sortOrder), asc(faqs.id)),
);

// ── Articles (Catatan Dapur) ──────────────────────────────────
export interface JournalCard {
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  coverAlt?: string;
  publishedAt?: string;
  category?: { slug: string; name: string } | null;
}
export interface JournalPost extends JournalCard {
  bodyHtml: string;
  shortAnswer?: string;
  sources: { title: string; url: string }[];
  relatedProducts: string[];
  modifiedAt?: string;
  author?: string;
  tags: { slug: string; name: string }[];
  seo: SeoFields;
  related: JournalCard[];
  updatedAt?: string;
}

interface ArticleSnapshot {
  title: string;
  slug: string;
  excerpt?: string;
  bodyHtml: string;
  featuredImage?: ImageRef | null;
  author?: string;
  publishedAt?: string;
  category?: { slug: string; name: string } | null;
  tags?: { slug: string; name: string }[];
  seo?: SeoFields;
  relatedIds?: number[];
  shortAnswer?: string;
  sources?: { title: string; url: string }[];
  relatedProducts?: string[];
  modifiedAt?: string;
}

/** Working copy of an article in the same shape as a published snapshot. */
async function articleDraftSnapshot(a: typeof articles.$inferSelect): Promise<ArticleSnapshot> {
  const cat = a.categoryId
    ? (await db.select().from(articleCategories).where(eq(articleCategories.id, a.categoryId)).limit(1))[0]
    : undefined;
  const tagRows = await db
    .select({ slug: tags.slug, name: tags.name })
    .from(articleTags)
    .innerJoin(tags, eq(tags.id, articleTags.tagId))
    .where(eq(articleTags.articleId, a.id));
  return {
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt ?? undefined,
    bodyHtml: a.bodyHtml,
    featuredImage: a.featuredImage,
    author: a.author ?? undefined,
    publishedAt: a.publishedAt?.toISOString(),
    category: cat ? { slug: cat.slug, name: cat.name } : null,
    tags: tagRows,
    seo: a.seo,
    relatedIds: a.relatedIds,
    shortAnswer: a.shortAnswer ?? undefined,
    sources: a.sources ?? [],
    relatedProducts: a.relatedProducts ?? [],
    modifiedAt: a.updatedAt.toISOString(),
  };
}

const loadArticles = cached('articles', async (preview): Promise<{ id: number; snap: ArticleSnapshot; updatedAt: string }[]> => {
  const rows = await db
    .select()
    .from(articles)
    .where(preview ? undefined : and(eq(articles.status, 'published'), isNotNull(articles.published)))
    .orderBy(desc(articles.publishedAt), desc(articles.id));
  const out = [];
  for (const r of rows) {
    const snap = preview ? await articleDraftSnapshot(r) : (r.published as unknown as ArticleSnapshot);
    if (snap) out.push({ id: r.id, snap, updatedAt: r.updatedAt.toISOString() });
  }
  return out;
});

const toCard = (s: ArticleSnapshot): JournalCard => ({
  slug: s.slug,
  title: s.title,
  excerpt: s.excerpt,
  coverImage: imgUrl(s.featuredImage),
  coverAlt: s.featuredImage?.alt,
  publishedAt: s.publishedAt,
  category: s.category ?? null,
});

export async function getJournalPosts(): Promise<JournalCard[]> {
  return (await loadArticles()).map((a) => toCard(a.snap));
}

export async function getJournalPost(slug: string): Promise<JournalPost | null> {
  const all = await loadArticles();
  const hit = all.find((a) => a.snap.slug === slug);
  if (!hit) return null;
  const s = hit.snap;
  const related = (s.relatedIds ?? [])
    .map((id) => all.find((a) => a.id === id))
    .filter(Boolean)
    .map((a) => toCard(a!.snap));
  // Fill up with same-category posts when fewer than 3 were picked.
  if (related.length < 3) {
    for (const a of all) {
      if (related.length >= 3) break;
      if (a.id === hit.id || related.some((r) => r.slug === a.snap.slug)) continue;
      if (s.category && a.snap.category?.slug === s.category.slug) related.push(toCard(a.snap));
    }
  }
  return {
    ...toCard(s),
    bodyHtml: s.bodyHtml,
    shortAnswer: s.shortAnswer,
    sources: s.sources ?? [],
    relatedProducts: s.relatedProducts ?? [],
    modifiedAt: s.modifiedAt ?? hit.updatedAt,
    author: s.author,
    tags: s.tags ?? [],
    seo: s.seo ?? {},
    related,
    updatedAt: hit.updatedAt,
  };
}

/** Published articles that are about a given product. */
export async function getArticlesForProduct(slug: string): Promise<JournalCard[]> {
  return (await loadArticles()).filter((a) => (a.snap.relatedProducts ?? []).includes(slug)).map((a) => toCard(a.snap));
}

// ── Pages & page-builder sections ─────────────────────────────
/** A page-builder section (validated JSON), images as { url, alt }. */
export type Section = Record<string, unknown> & { _type: string; _key: string };

export interface CmsPage {
  id: number;
  slug: string;
  title: string;
  seo: SeoFields;
  sections: Section[];
  updatedAt?: string;
}

interface PageDoc {
  title?: string;
  slug?: string;
  sections?: Section[];
  seo?: SeoFields;
}

function toCmsPage(r: typeof pages.$inferSelect, preview: boolean): CmsPage | null {
  const doc = (preview ? r.draft : r.published) as PageDoc | null;
  if (!doc) return null;
  return {
    id: r.id,
    slug: doc.slug ?? r.slug,
    title: doc.title ?? r.title,
    seo: doc.seo ?? {},
    sections: (doc.sections ?? []).filter(Boolean),
    updatedAt: (r.publishedAt ?? r.updatedAt)?.toISOString(),
  };
}

const loadBuiltIn = cached('builtInPage', async (preview, key: string) => {
  const [r] = await db.select().from(pages).where(eq(pages.builtinKey, key)).limit(1);
  if (!r || (!preview && r.status !== 'published')) return null;
  return toCmsPage(r, preview);
});

/**
 * A built-in page's builder layout. Null when it has no visible sections —
 * the route then renders its original coded layout.
 */
export async function getBuiltInPage(key: BuiltInPageKey): Promise<CmsPage | null> {
  const page = await loadBuiltIn(key);
  return page && page.sections.some((s) => !s.hidden) ? page : null;
}

/** Built-in page record (for SEO) even when its sections are empty. */
export async function getBuiltInPageMeta(key: BuiltInPageKey): Promise<CmsPage | null> {
  return loadBuiltIn(key);
}

const loadCustomPage = cached('page', async (preview, slug: string) => {
  const where = preview
    ? and(or(eq(pages.slug, slug), eq(pages.publishedSlug, slug)))
    : and(eq(pages.publishedSlug, slug), eq(pages.status, 'published'));
  const rows = await db.select().from(pages).where(where).limit(2);
  const r = rows.find((x) => !x.builtinKey);
  return r ? toCmsPage(r, preview) : null;
});

export async function getPage(slug: string): Promise<CmsPage | null> {
  if (RESERVED_SLUGS.includes(slug)) return null;
  return loadCustomPage(slug);
}

export const getPageSlugs = cached('pageSlugs', async () => {
  const rows = await db
    .select({ slug: pages.publishedSlug, published: pages.published })
    .from(pages)
    .where(and(eq(pages.status, 'published'), isNotNull(pages.publishedSlug)));
  return rows
    .filter((r) => r.slug && !RESERVED_SLUGS.includes(r.slug) && !((r.published as PageDoc | null)?.seo?.noindex))
    .map((r) => r.slug as string)
    .filter((s) => !Object.values(BUILT_IN_PAGES).some((b) => b.path === `/${s}`));
});

// ── Redirects ─────────────────────────────────────────────────
export const getRedirect = cached('redirect', async (_p, path: string) => {
  const [r] = await db
    .select({ to: redirects.toPath, code: redirects.statusCode })
    .from(redirects)
    .where(eq(redirects.fromPath, path))
    .limit(1);
  return r ?? null;
});

// ── Legacy settings shape (coded fallback layouts, sub-brand labels) ──
export async function getSiteSettings() {
  const { site } = await getSettings();
  return {
    tagline: site.tagline,
    brandLineEn: site.brandLineEn,
    umbrellaPromise: site.description,
    heroHeadline: site.heroHeadline,
    essence: site.essence,
    founderQuote: site.founderQuote,
    founderName: site.founderName,
    founderRole: site.founderRole,
    heroImage: undefined as string | undefined,
    founderImage: undefined as string | undefined,
    heroStyle: 'cream' as 'cream' | 'teal' | 'blush',
    logo: site.logo?.url,
    logoLight: site.logoLight?.url,
    monogram: site.monogram?.url,
    backgroundMotif: site.backgroundMotif as 'songket-geometric' | 'bunga-floral' | 'daun-leaf' | 'geometric-gold' | 'none',
    motifImage: undefined as string | undefined,
    motifOpacity: site.motifOpacity / 100,
    email: site.email,
    phone: site.phone,
    whatsappNumber: site.whatsappNumber,
    address: site.address,
    operatingHours: site.operatingHours,
    instagram: site.instagram,
    tiktok: site.tiktok,
    threads: site.threads,
    coverage: site.serviceArea,
    seasonal: site.seasonal,
    subBrandLabels: site.subBrandLabels,
  };
}
