import type { Metadata } from 'next';
import { site } from '@/content/site';

/**
 * Per-page metadata helper (§11). Builds title/description + OpenGraph/Twitter.
 * Default OG image = branded cream card with logo + tagline.
 */
export function buildMetadata({
  title,
  description,
  path = '/',
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const fullTitle = path === '/' ? `${site.name} — ${site.tagline}` : `${title} · ${site.name}`;
  const url = `${site.url}${path}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    // OG/Twitter images are supplied by the file-convention generators
    // (app/opengraph-image.tsx, app/twitter-image.tsx).
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: site.name,
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}
