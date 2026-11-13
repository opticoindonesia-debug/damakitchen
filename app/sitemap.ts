import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { getBuiltInPageMeta, getJournalPosts, getPageSlugs, getProducts, getSubBrands } from '@/lib/cms';
import { BUILT_IN_PAGES, type BuiltInPageKey } from '@/lib/pages';

export const dynamic = 'force-dynamic';

/** Dynamic sitemap: published, indexable content only. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [journal, pageSlugs, subBrands, products] = await Promise.all([
    getJournalPosts(),
    getPageSlugs(),
    getSubBrands(),
    getProducts(),
  ]);
  const builtIns = await Promise.all(
    (Object.keys(BUILT_IN_PAGES) as BuiltInPageKey[]).map(async (k) => ({ k, meta: await getBuiltInPageMeta(k) })),
  );

  const entries: { path: string; lastModified?: string; priority?: number }[] = [
    ...builtIns
      .filter(({ meta }) => !meta?.seo?.noindex)
      .map(({ k, meta }) => ({ path: BUILT_IN_PAGES[k].path, lastModified: meta?.updatedAt, priority: k === 'beranda' ? 1 : 0.8 })),
    { path: '/catatan-dapur', lastModified: journal[0]?.publishedAt },
    ...subBrands.filter((sb) => !sb.seo?.noindex).map((sb) => ({ path: `/${sb.slug}`, priority: 0.8 })),
    ...products.filter((p) => !p.seo.noindex).map((p) => ({ path: `/menu/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...journal.map((p) => ({ path: `/catatan-dapur/${p.slug}`, lastModified: p.publishedAt, priority: 0.6 })),
    ...pageSlugs.map((s) => ({ path: `/${s}`, priority: 0.6 })),
  ];

  return entries.map((e) => ({
    url: `${site.url}${e.path}`,
    lastModified: e.lastModified ? new Date(e.lastModified) : new Date(),
    changeFrequency: 'weekly',
    priority: e.priority ?? 0.7,
  }));
}
