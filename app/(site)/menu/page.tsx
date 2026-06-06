import { Section } from '@/components/Section';
import { MenuExplorer } from '@/components/MenuExplorer';
import { ProductListJsonLd } from '@/components/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { getProducts, getSubBrands } from '@/lib/cms';

export const metadata = buildMetadata({
  title: 'Menu',
  description:
    'Jelajahi seluruh hidangan DAMA, dikelompokkan per lini — dari rendang beku hingga hampers.',
  path: '/menu',
});

export default async function MenuPage() {
  const [products, subBrands] = await Promise.all([getProducts(), getSubBrands()]);
  const nameBySlug = Object.fromEntries(subBrands.map((s) => [s.slug, s.name]));
  const jsonLdProducts = products.map((p) => ({
    name: p.name,
    description: p.blurb,
    brand: nameBySlug[p.subBrand] ?? 'DAMA KITCHEN',
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
        <MenuExplorer products={products} subBrands={subBrands} />
      </Section>
    </>
  );
}
