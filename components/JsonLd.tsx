import { site as siteConst } from '@/content/site';
import type { SiteSettingsData } from '@/lib/settings';

/** Serializes JSON-LD safely for inline <script> (escapes "<" to prevent breaking out). */
export function JsonLdScript({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

const abs = (url?: string) => (!url ? undefined : url.startsWith('http') ? url : `${siteConst.url}${url}`);

/** Organization + FoodEstablishment, from Pengaturan Situs. */
export function OrganizationJsonLd({ site }: { site: SiteSettingsData }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'FoodEstablishment'],
    name: site.siteName,
    description: site.description,
    url: siteConst.url,
    slogan: site.tagline,
    servesCuisine: 'Minangkabau',
    image: abs(site.ogImage?.url) ?? `${siteConst.url}/opengraph-image`,
    ...(site.logo?.url ? { logo: abs(site.logo.url) } : {}),
    sameAs: [site.instagram, site.tiktok, site.threads, site.facebook, site.youtube].filter(Boolean),
    ...(site.email ? { email: site.email } : {}),
    telephone: site.phone || `+${site.whatsappNumber}`,
    ...(site.address ? { address: site.address } : {}),
    ...(site.serviceArea ? { areaServed: site.serviceArea } : {}),
  };
  return <JsonLdScript data={data} />;
}

export function ProductListJsonLd({ products }: { products: { name: string; description: string; brand: string; url?: string; price?: number | null }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      ...(p.url ? { url: abs(p.url) } : {}),
      item: {
        '@type': 'Product',
        name: p.name,
        description: p.description,
        brand: { '@type': 'Brand', name: p.brand },
        ...(p.price != null ? { offers: { '@type': 'Offer', price: p.price, priceCurrency: 'IDR' } } : {}),
      },
    })),
  };
  return <JsonLdScript data={data} />;
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

export { abs as absoluteUrl };
