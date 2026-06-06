import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { subBrandList } from '@/content/subbrands';
import { getJournalPosts, getPageSlugs } from '@/lib/cms';

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

  const [journal, pageSlugs] = await Promise.all([getJournalPosts(), getPageSlugs()]);

  const now = new Date();
  const paths = [
    ...staticPaths,
    ...subBrandList.map((sb) => `/${sb.slug}`),
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
