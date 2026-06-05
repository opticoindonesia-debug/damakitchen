import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { subBrandList } from '@/content/subbrands';

export default function sitemap(): MetadataRoute.Sitemap {
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

  const now = new Date();

  return [...staticPaths, ...subBrandList.map((sb) => `/${sb.slug}`)].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
