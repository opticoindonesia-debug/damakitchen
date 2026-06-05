import { Section } from '@/components/Section';
import { MenuExplorer } from '@/components/MenuExplorer';
import { ProductListJsonLd } from '@/components/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { products } from '@/content/products';
import { subBrands } from '@/content/subbrands';

export const metadata = buildMetadata({
  title: 'Menu',
  description:
    'Jelajahi seluruh hidangan DAMA, dikelompokkan per lini — dari rendang beku hingga hampers.',
  path: '/menu',
});

export default function MenuPage() {
  const jsonLdProducts = products.map((p) => ({
    name: p.name,
    description: p.blurb,
    brand: subBrands[p.subBrand].name,
  }));

  return (
    <>
      <ProductListJsonLd products={jsonLdProducts} />
      <Section
        eyebrow="Menu"
        title="Seluruh hidangan DAMA"
        titleAs="h1"
        intro="Dikelompokkan per lini. Saring sesuai suasana yang Anda cari, lalu pesan lewat kanal yang tersedia."
      >
        <MenuExplorer />
      </Section>
    </>
  );
}
