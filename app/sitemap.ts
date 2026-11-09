import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { getJournalPosts, getPageSlugs, getSubBrands } from '@/lib/cms';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    '/',
    '/cerita',
    '/menu',
    '/katering',
    '/hadiah',
    '/pesan',
    '/kontak',
    '/catatan-dapur',
  ];

  // Same filtered sources as the routes, so disabled lines never appear here.
  const [journal, pageSlugs, subBrands] = await Promise.all([
    getJournalPosts(),
    getPageSlugs(),
    getSubBrands(),
  ]);

  const now = new Date();
  const paths = [
    ...staticPaths,
    ...subBrands.map((sb) => `/${sb.slug}`),
    ...journal.map((p) => `/catatan-dapur/${p.slug}`),
    ...pageSlugs.map((s) => `/${s}`),
  ];

  return paths.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
