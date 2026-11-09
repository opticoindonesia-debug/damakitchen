import type { Metadata } from 'next';
import { site } from '@/content/site';

/**
 * Per-page metadata helper (§11). Builds title/description + OpenGraph/Twitter.
 * Default OG image = branded cream card with logo + tagline.
 *
 * The title is emitted as `absolute` so the root layout's "%s · DAMA KITCHEN"
 * template is not applied a second time.
 */
export function buildMetadata({
  title,
  description,
  path = '/',
  absoluteTitle,
}: {
  title: string;
  description: string;
  path?: string;
  /** Exact browser/SEO title (from Studio "Judul SEO"); skips the brand suffix. */
  absoluteTitle?: string;
}): Metadata {
  const fullTitle =
    absoluteTitle?.trim() ||
    (path === '/' ? `${site.name} — ${site.tagline}` : `${title} · ${site.name}`);
  const url = `${site.url}${path}`;

  return {
    title: { absolute: fullTitle },
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
