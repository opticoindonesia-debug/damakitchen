import type { Metadata } from 'next';
import { site } from '@/content/site';
import type { SeoFields } from '@/lib/db/schema';

/**
 * Per-page metadata helper (§11). Builds title/description, canonical,
 * robots and OpenGraph/Twitter from the page's SEO fields (Admin → SEO tab),
 * falling back to sensible defaults.
 *
 * The title is emitted as `absolute` so the root layout's "%s · DAMA KITCHEN"
 * template is not applied a second time.
 */

const absUrl = (u: string) => (/^https?:\/\//.test(u) ? u : `${site.url}${u.startsWith('/') ? '' : '/'}${u}`);

/** Canonical: an editor override only if it is a valid same-site path or absolute https URL. */
export function canonicalFor(path: string, override?: string): string {
  const o = override?.trim();
  if (o) {
    if (/^\/(?!\/)[^\s]*$/.test(o)) return absUrl(o);
    try {
      const u = new URL(o);
      if (u.protocol === 'https:') return u.toString();
    } catch {
      /* fall through to the page's own URL */
    }
  }
  return absUrl(path);
}

export function buildMetadata({
  title,
  description,
  path = '/',
  absoluteTitle,
  seo,
  siteName = site.name,
  image,
  type = 'website',
}: {
  title: string;
  description: string;
  path?: string;
  /** Exact browser/SEO title; skips the brand suffix. */
  absoluteTitle?: string;
  seo?: SeoFields | null;
  siteName?: string;
  /** Fallback share image (e.g. article cover, product photo). */
  image?: string;
  type?: 'website' | 'article';
}): Metadata {
  const fullTitle =
    seo?.title?.trim() ||
    absoluteTitle?.trim() ||
    (path === '/' ? `${siteName} — ${site.tagline}` : `${title} · ${siteName}`);
  const desc = seo?.description?.trim() || description;
  const url = canonicalFor(path, seo?.canonical);
  const ogImage = seo?.ogImage?.url || image;

  return {
    title: { absolute: fullTitle },
    description: desc,
    alternates: { canonical: url },
    ...(seo?.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: seo?.ogTitle?.trim() || fullTitle,
      description: seo?.ogDescription?.trim() || desc,
      url,
      siteName,
      locale: 'id_ID',
      type,
      // Without an image the file-convention generator (app/opengraph-image.tsx) is used.
      ...(ogImage ? { images: [{ url: absUrl(ogImage) }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.ogTitle?.trim() || fullTitle,
      description: seo?.ogDescription?.trim() || desc,
      ...(ogImage ? { images: [absUrl(ogImage)] } : {}),
    },
  };
}
