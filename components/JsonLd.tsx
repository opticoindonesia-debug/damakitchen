import { site as siteConst } from '@/content/site';
import type { SiteSettingsData } from '@/lib/settings';
import type { SubBrand } from '@/content/subbrands';

/**
 * Schema.org JSON-LD. One stable entity graph:
 *   Organization  {SITE}/#organization   — DAMA KITCHEN (mother brand)
 *   WebSite       {SITE}/#website
 *   Brand         {SITE}/<sub-brand>#brand — each sub-brand, listed in Organization.brand
 * Pages reference these @ids instead of redefining them (no conflicting entities).
 * Only facts that exist in the admin are emitted — nothing is invented
 * (no address, opening hours, ratings or reviews).
 */

const SITE = siteConst.url.replace(/\/$/, '');
export const ORG_ID = `${SITE}/#organization`;
export const WEBSITE_ID = `${SITE}/#website`;
export const brandId = (slug: string) => `${SITE}/${slug}#brand`;
const abs = (url?: string) => (!url ? undefined : url.startsWith('http') ? url : `${SITE}${url.startsWith('/') ? '' : '/'}${url}`);

/** Serializes JSON-LD safely for inline <script> (escapes "<"). */
export function JsonLdScript({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

/** Site-wide graph, rendered once in the public layout. */
export function SiteJsonLd({ site, subBrands }: { site: SiteSettingsData; subBrands: SubBrand[] }) {
  const sameAs = [site.instagram, site.tiktok, site.threads, site.facebook, site.youtube].filter(Boolean);
  const organization = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: site.siteName,
    url: `${SITE}/`,
    description: site.organizationDescription,
    slogan: site.tagline,
    ...(site.logo?.url ? { logo: abs(site.logo.url) } : {}),
    ...(site.ogImage?.url ? { image: abs(site.ogImage.url) } : {}),
    knowsAbout: ['Masakan Minang', 'Minangkabau cuisine'],
    ...(sameAs.length ? { sameAs } : {}),
    ...(site.email ? { email: site.email } : {}),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: `+${site.whatsappNumber}`,
      url: `https://wa.me/${site.whatsappNumber}`,
      availableLanguage: ['id'],
    },
    brand: subBrands.map((sb) => ({ '@id': brandId(sb.slug) })),
  };
  const website = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: site.siteName,
    url: `${SITE}/`,
    inLanguage: 'id-ID',
    publisher: { '@id': ORG_ID },
  };
  const brands = subBrands.map((sb) => ({
    '@type': 'Brand',
    '@id': brandId(sb.slug),
    name: sb.name,
    description: sb.lead,
    url: `${SITE}/${sb.slug}`,
    ...(sb.heroImage ? { image: abs(sb.heroImage) } : {}),
  }));
  return <JsonLdScript data={{ '@context': 'https://schema.org', '@graph': [organization, website, ...brands] }} />;
}

export function ProductListJsonLd({ products }: { products: { name: string; description: string; brandSlug?: string; url?: string; price?: number | null }[] }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: products.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          ...(p.url ? { url: abs(p.url) } : {}),
          name: p.name,
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
      }}
    />
  );
}

/** A service DAMA offers (katering, corporate, hampers). No area/price claims unless supplied. */
export function ServiceJsonLd({ name, description, path, serviceType, brandSlugs = [] }: { name: string; description: string; path: string; serviceType: string; brandSlugs?: string[] }) {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${SITE}${path}#service`,
        name,
        description,
        serviceType,
        url: `${SITE}${path}`,
        provider: { '@id': ORG_ID },
        ...(brandSlugs.length ? { brand: brandSlugs.map((s) => ({ '@id': brandId(s) })) } : {}),
      }}
    />
  );
}

export { abs as absoluteUrl };
