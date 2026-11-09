import 'server-only';
import type { Metadata } from 'next';
import { getBuiltInPage } from '@/lib/cms';
import { BUILT_IN_PAGES, type BuiltInPageKey } from '@/lib/pages';
import { buildMetadata } from '@/lib/seo';

/**
 * Metadata for a built-in page: the coded defaults, overridden by the page's
 * Studio "SEO" tab when its page-builder layout is active.
 */
export async function builtInMetadata(
  key: BuiltInPageKey,
  fallback: { title: string; description: string },
): Promise<Metadata> {
  const page = await getBuiltInPage(key);
  return buildMetadata({
    title: page?.title || fallback.title,
    description: page?.seoDescription || fallback.description,
    path: BUILT_IN_PAGES[key].path,
    absoluteTitle: page?.seoTitle,
  });
}
