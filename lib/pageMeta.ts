import 'server-only';
import type { Metadata } from 'next';
import { getBuiltInPageMeta, getSettings } from '@/lib/cms';
import { BUILT_IN_PAGES, type BuiltInPageKey } from '@/lib/pages';
import { buildMetadata } from '@/lib/seo';

/** Metadata for a built-in page: coded defaults overridden by the page's SEO tab. */
export async function builtInMetadata(
  key: BuiltInPageKey,
  fallback: { title: string; description: string },
): Promise<Metadata> {
  const [page, { site }] = await Promise.all([getBuiltInPageMeta(key), getSettings()]);
  const seo = { ...(page?.seo ?? {}) };
  if (key === 'beranda') {
    seo.title ||= site.seoTitle;
    seo.description ||= site.seoDescription;
  }
  return buildMetadata({
    title: page?.title || fallback.title,
    description: fallback.description,
    path: BUILT_IN_PAGES[key].path,
    seo,
    siteName: site.siteName,
    image: site.ogImage?.url,
  });
}
