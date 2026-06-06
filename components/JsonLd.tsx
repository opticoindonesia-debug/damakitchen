import { site } from '@/content/site';
import { contact } from '@/content/channels';

/**
 * JSON-LD structured data (§11). Organization + FoodEstablishment.
 * Product schema lives on the menu page.
 */
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'FoodEstablishment'],
    name: site.name,
    description: site.umbrellaPromise,
    url: site.url,
    slogan: site.tagline,
    servesCuisine: 'Minangkabau',
    image: `${site.url}/og-default.png`,
    sameAs: [contact.instagram.href, contact.tiktok.href, contact.threads.href],
    email: contact.email,
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProductListJsonLd({
  products,
}: {
  products: { name: string; description: string; brand: string }[];
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        description: p.description,
        brand: { '@type': 'Brand', name: p.brand },
        // TODO: add offers/price when confirmed.
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
