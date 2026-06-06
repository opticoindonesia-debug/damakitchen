import { sanityClient, sanityConfigured } from '@/lib/sanity/client';
import { urlForImage } from '@/lib/sanity/image';
import {
  subBrandList as staticSubBrands,
  subBrands as staticSubBrandMap,
  type SubBrand,
  type SubBrandSlug,
} from '@/content/subbrands';
import {
  products as staticProducts,
  productsBySubBrand as staticProductsBySubBrand,
  type Product,
} from '@/content/products';
import { pillars as staticPillars, type Pillar } from '@/content/pillars';
import { values as staticValues, type BrandValue } from '@/content/values';

/**
 * Content access layer. Each getter returns the same TypeScript shapes used
 * across the app. When Sanity isn't configured it returns the static /content
 * data, so the site works identically with or without the CMS connected.
 *
 * Design tokens (sub-brand marker colors + slugs) stay in code; the CMS only
 * supplies editable copy, photos and prices, which we merge here.
 */

const subBrandTokens: Record<SubBrandSlug, Pick<SubBrand, 'marker' | 'markerHex'>> =
  Object.fromEntries(
    staticSubBrands.map((s) => [s.slug, { marker: s.marker, markerHex: s.markerHex }]),
  ) as Record<SubBrandSlug, Pick<SubBrand, 'marker' | 'markerHex'>>;

// ── Sub-brands ────────────────────────────────────────────────
export async function getSubBrands(): Promise<SubBrand[]> {
  if (!sanityConfigured) return staticSubBrands;
  const docs = await sanityClient.fetch<Array<Record<string, unknown>>>(
    `*[_type=="subBrand"]|order(order asc){
      "slug":slug, name, shortName, emotion, lead, about, howToOrder,
      channels, faqs[]{q,a}, crossSell, heroImage
    }`,
  );
  if (!docs?.length) return staticSubBrands;
  return docs.map((d) => {
    const slug = d.slug as SubBrandSlug;
    const base = staticSubBrandMap[slug]; // sensible defaults for empty fields
    return {
      ...base,
      slug,
      name: (d.name as string) ?? base?.name,
      shortName: (d.shortName as string) ?? base?.shortName,
      emotion: (d.emotion as string) ?? base?.emotion,
      lead: (d.lead as string) ?? base?.lead,
      about: (d.about as string) ?? base?.about,
      howToOrder: (d.howToOrder as string) ?? base?.howToOrder,
      channels: (d.channels as SubBrand['channels']) ?? base?.channels,
      faqs: (d.faqs as SubBrand['faqs']) ?? base?.faqs ?? [],
      crossSell: (d.crossSell as SubBrandSlug[]) ?? base?.crossSell ?? [],
      ...subBrandTokens[slug],
      heroImage: urlForImage(d.heroImage as never) ?? base?.heroImage,
    } satisfies SubBrand;
  });
}

export async function getSubBrand(slug: SubBrandSlug): Promise<SubBrand | undefined> {
  const all = await getSubBrands();
  return all.find((s) => s.slug === slug);
}

// ── Products ──────────────────────────────────────────────────
export async function getProducts(): Promise<Product[]> {
  if (!sanityConfigured) return staticProducts;
  const docs = await sanityClient.fetch<Array<Record<string, unknown>>>(
    `*[_type=="product"]|order(order asc){
      "id":coalesce(slug.current,_id), name, blurb,
      "subBrand":subBrand->slug, info, price, imageCategory, image
    }`,
  );
  if (!docs?.length) return staticProducts;
  return docs.map((d) => ({
    id: d.id as string,
    name: d.name as string,
    blurb: (d.blurb as string) ?? '',
    subBrand: d.subBrand as SubBrandSlug,
    info: (d.info as Product['info']) ?? [],
    price: (d.price as number) ?? null,
    imageCategory: (d.imageCategory as Product['imageCategory']) ?? 'food',
    image: urlForImage(d.image as never),
  }));
}

export async function getProductsBySubBrand(slug: SubBrandSlug): Promise<Product[]> {
  if (!sanityConfigured) return staticProductsBySubBrand(slug);
  const all = await getProducts();
  return all.filter((p) => p.subBrand === slug);
}

// ── Pillars / values ──────────────────────────────────────────
export async function getPillars(): Promise<Pillar[]> {
  if (!sanityConfigured) return staticPillars;
  const docs = await sanityClient.fetch<Pillar[]>(
    `*[_type=="pillar"]|order(order asc){title,desc,icon}`,
  );
  return docs?.length ? docs : staticPillars;
}

export async function getValues(): Promise<BrandValue[]> {
  if (!sanityConfigured) return staticValues;
  const docs = await sanityClient.fetch<BrandValue[]>(
    `*[_type=="brandValue"]|order(order asc){title,desc}`,
  );
  return docs?.length ? docs : staticValues;
}

// ── Journal (Catatan Dapur) ───────────────────────────────────
export interface JournalCard {
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: string;
}
export interface JournalPost extends JournalCard {
  body: unknown;
}

export async function getJournalPosts(): Promise<JournalCard[]> {
  if (!sanityConfigured) return [];
  const docs = await sanityClient.fetch<Array<Record<string, unknown>>>(
    `*[_type=="journalPost" && defined(slug.current)]|order(publishedAt desc){
      "slug":slug.current, title, excerpt, publishedAt, coverImage
    }`,
  );
  return (docs ?? []).map((d) => ({
    slug: d.slug as string,
    title: d.title as string,
    excerpt: d.excerpt as string | undefined,
    publishedAt: d.publishedAt as string | undefined,
    coverImage: urlForImage(d.coverImage as never, 800),
  }));
}

export async function getJournalPost(slug: string): Promise<JournalPost | null> {
  if (!sanityConfigured) return null;
  const d = await sanityClient.fetch<Record<string, unknown> | null>(
    `*[_type=="journalPost" && slug.current==$slug][0]{
      "slug":slug.current, title, excerpt, publishedAt, coverImage, body
    }`,
    { slug },
  );
  if (!d) return null;
  return {
    slug: d.slug as string,
    title: d.title as string,
    excerpt: d.excerpt as string | undefined,
    publishedAt: d.publishedAt as string | undefined,
    coverImage: urlForImage(d.coverImage as never),
    body: d.body,
  };
}

// ── Free pages ────────────────────────────────────────────────
export interface CmsPage {
  slug: string;
  title: string;
  eyebrow?: string;
  intro?: string;
  heroImage?: string;
  body: unknown;
  seoDescription?: string;
}

export async function getPageSlugs(): Promise<string[]> {
  if (!sanityConfigured) return [];
  const slugs = await sanityClient.fetch<string[]>(
    `*[_type=="page" && defined(slug.current)].slug.current`,
  );
  return slugs ?? [];
}

export async function getPage(slug: string): Promise<CmsPage | null> {
  if (!sanityConfigured) return null;
  const d = await sanityClient.fetch<Record<string, unknown> | null>(
    `*[_type=="page" && slug.current==$slug][0]{
      "slug":slug.current, title, eyebrow, intro, heroImage, body, seoDescription
    }`,
    { slug },
  );
  if (!d) return null;
  return {
    slug: d.slug as string,
    title: d.title as string,
    eyebrow: d.eyebrow as string | undefined,
    intro: d.intro as string | undefined,
    heroImage: urlForImage(d.heroImage as never),
    body: d.body,
    seoDescription: d.seoDescription as string | undefined,
  };
}
