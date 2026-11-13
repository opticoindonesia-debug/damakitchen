import { Section } from '@/components/Section';
import { MenuExplorer } from '@/components/MenuExplorer';
import { ProductListJsonLd } from '@/components/JsonLd';
import { TrackOnView } from '@/components/AnalyticsTracker';
import { builtInMetadata } from '@/lib/pageMeta';
import { PageBuilder } from '@/components/builder/PageBuilder';
import { getBuiltInPage, getProducts, getSubBrands } from '@/lib/cms';

export function generateMetadata() {
  return builtInMetadata('menu', {
  title: 'Menu',
  description:
    'Jelajahi seluruh hidangan DAMA, dikelompokkan per lini — dari rendang beku hingga hampers.',
  });
}

export default async function MenuPage() {
  const [products, subBrands] = await Promise.all([getProducts(), getSubBrands()]);
  const jsonLdProducts = products.map((p) => ({ name: p.name, description: p.blurb, url: `/menu/${p.slug}` }));

  const cms = await getBuiltInPage('menu');
  if (cms) {
    return (
      <>
        <ProductListJsonLd products={jsonLdProducts} />
        <TrackOnView event="view_item_list" params={{ item_list_name: 'Menu', items: products.length }} />
        <PageBuilder sections={cms.sections} />
      </>
    );
  }

  return (
    <>
      <ProductListJsonLd products={jsonLdProducts} />
      <Section
        eyebrow="Menu"
        title="Seluruh hidangan DAMA"
        titleAs="h1"
        intro="Dikelompokkan per lini. Saring sesuai suasana yang Anda cari, lalu pesan lewat kanal yang tersedia."
      >
        <MenuExplorer products={products} subBrands={subBrands} />
      </Section>
    </>
  );
}
