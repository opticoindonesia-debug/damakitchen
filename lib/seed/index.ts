import 'server-only';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  brandItems,
  pages,
  productCategories,
  products,
  settings,
  subBrands,
  testimonials,
} from '@/lib/db/schema';
import { subBrandList } from '@/content/subbrands';
import { products as productContent } from '@/content/products';
import { pillars } from '@/content/pillars';
import { values } from '@/content/values';
import { testimonials as testimonialContent } from '@/content/testimonials';
import { BUILT_IN_PAGES, type BuiltInPageKey } from '@/lib/pages';
import { DEFAULT_NAVIGATION, DEFAULT_SITE, DEFAULT_THEME } from '@/lib/settings';
import { validateSections } from '@/lib/sections/validate';
import { buildPageSeeds } from './pages';

/**
 * Initial content import from the code that powered the site before the CMS
 * (/content/*.ts + the 7 built-in page layouts). Idempotent: each table is
 * only seeded while it is EMPTY, so existing edits are never overwritten.
 */

/** Product categories derived from each line's format. */
const CATEGORY_BY_SUBBRAND: Record<string, { slug: string; name: string }> = {
  'lamak-dama': { slug: 'frozen-siap-panas', name: 'Frozen siap panas' },
  'warisan-dama': { slug: 'hidangan-warisan', name: 'Hidangan warisan (pre-order)' },
  'hidang-basamo': { slug: 'katering-acara', name: 'Katering & acara' },
  'dama-kapau': { slug: 'kotakan-acara', name: 'Besek & kotakan acara' },
  'tando-mato': { slug: 'hampers', name: 'Hampers & hadiah' },
};

const isEmpty = async (table: any) => {
  const [r] = await db.select({ n: sql<number>`count(*)` }).from(table);
  return Number(r.n) === 0;
};

export async function seedIfEmpty(): Promise<string[]> {
  const done: string[] = [];

  if (await isEmpty(settings)) {
    const now = new Date();
    await db.insert(settings).values([
      { key: 'site', draft: DEFAULT_SITE as never, published: DEFAULT_SITE as never, publishedAt: now },
      { key: 'theme', draft: DEFAULT_THEME as never, published: DEFAULT_THEME as never, publishedAt: now },
      { key: 'navigation', draft: DEFAULT_NAVIGATION as never, published: DEFAULT_NAVIGATION as never, publishedAt: now },
    ]);
    done.push('settings');
  }

  if (await isEmpty(subBrands)) {
    await db.insert(subBrands).values(
      subBrandList.map((s, i) => ({
        slug: s.slug,
        name: s.name,
        shortName: s.shortName,
        emotion: s.emotion,
        lead: s.lead,
        about: s.about,
        howToOrder: s.howToOrder,
        channelNote: s.channelNote ?? null,
        markerHex: s.markerHex,
        heroImage: s.heroImage ? { url: s.heroImage, alt: s.name } : null,
        channels: s.channels,
        faqs: s.faqs,
        crossSell: s.crossSell,
        extraSections: [],
        seo: {},
        enabled: !s.disabled,
        sortOrder: i,
      })),
    );
    done.push('sub_brands');
  }

  if (await isEmpty(productCategories)) {
    const seen = new Set<string>();
    const cats = subBrandList
      .map((s) => CATEGORY_BY_SUBBRAND[s.slug])
      .filter((c) => c && !seen.has(c.slug) && seen.add(c.slug));
    await db.insert(productCategories).values(cats.map((c, i) => ({ ...c, sortOrder: i })));
    done.push('product_categories');
  }

  if (await isEmpty(products)) {
    const sbRows = await db.select({ id: subBrands.id, slug: subBrands.slug }).from(subBrands);
    const catRows = await db.select({ id: productCategories.id, slug: productCategories.slug }).from(productCategories);
    const sbId = Object.fromEntries(sbRows.map((r) => [r.slug, r.id]));
    const catId = Object.fromEntries(catRows.map((r) => [r.slug, r.id]));
    await db.insert(products).values(
      productContent.map((p, i) => ({
        slug: p.id,
        name: p.name,
        subBrandId: sbId[p.subBrand] ?? null,
        categoryId: catId[CATEGORY_BY_SUBBRAND[p.subBrand]?.slug] ?? null,
        blurb: p.blurb,
        description: null,
        price: p.price,
        availability: p.subBrand === 'warisan-dama' ? ('preorder' as const) : ('available' as const),
        status: 'published' as const,
        image: p.image ? { url: p.image, alt: p.name } : null,
        gallery: [],
        info: p.info,
        imageCategory: p.imageCategory,
        orderLinks: [],
        seo: {},
        sortOrder: i,
      })),
    );
    done.push('products');
  }

  if (await isEmpty(brandItems)) {
    await db.insert(brandItems).values([
      ...pillars.map((p, i) => ({ kind: 'pillar' as const, title: p.title, body: p.desc, icon: p.icon, sortOrder: i })),
      ...values.map((v, i) => ({ kind: 'value' as const, title: v.title, body: v.desc, icon: null, sortOrder: i })),
    ]);
    done.push('brand_items');
  }

  if (await isEmpty(testimonials)) {
    await db.insert(testimonials).values(
      // Placeholder testimonials from the first build are kept but HIDDEN: only real,
      // consented testimonials may be shown publicly.
      testimonialContent.map((t, i) => ({ name: t.name, context: t.context, quote: t.quote, sortOrder: i, visible: false })),
    );
    done.push('testimonials');
  }

  // Built-in pages: insert any that are missing (never overwrite).
  const existing = new Set((await db.select({ k: pages.builtinKey }).from(pages)).map((r) => r.k));
  const seeds = buildPageSeeds();
  const now = new Date();
  const missing = seeds.filter((s) => !existing.has(String(s._id).replace(/^page-/, '')));
  for (const s of missing) {
    const key = String(s._id).replace(/^page-/, '') as BuiltInPageKey;
    const slug = BUILT_IN_PAGES[key].path.replace(/^\//, '');
    const { sections } = validateSections(s.sections, 'Bagian');
    const doc = { title: BUILT_IN_PAGES[key].title, slug, sections, seo: {} };
    await db.insert(pages).values({
      builtinKey: key,
      title: doc.title,
      slug,
      draft: doc,
      published: doc,
      publishedSlug: slug,
      status: 'published',
      hasChanges: false,
      sortOrder: Object.keys(BUILT_IN_PAGES).indexOf(key),
      publishedAt: now,
    });
  }
  if (missing.length) done.push(`pages(${missing.length})`);

  return done;
}
