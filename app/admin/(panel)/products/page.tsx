import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productCategories, products, subBrands } from '@/lib/db/schema';
import { LinkButton, PageHeader } from '@/components/admin/ui';
import { ProductsList } from './ProductsList';

export default async function ProductsIndex() {
  const [rows, sbs, cats] = await Promise.all([
    db
      .select({ id: products.id, name: products.name, slug: products.slug, price: products.price, status: products.status, availability: products.availability, image: products.image, subBrand: subBrands.name, subBrandId: products.subBrandId })
      .from(products)
      .leftJoin(subBrands, eq(subBrands.id, products.subBrandId))
      .orderBy(asc(products.sortOrder), asc(products.id)),
    db.select({ id: subBrands.id, name: subBrands.name }).from(subBrands).orderBy(asc(subBrands.sortOrder)),
    db.select({ id: productCategories.id, name: productCategories.name, slug: productCategories.slug }).from(productCategories).orderBy(asc(productCategories.sortOrder)),
  ]);
  return (
    <>
      <PageHeader
        title="Produk & harga"
        description="Tambah dan ubah menu, harga, foto dan ketersediaan. Perubahan produk berstatus “Tayang” langsung tampil di website."
        actions={<LinkButton href="/admin/products/new" variant="primary">+ Produk baru</LinkButton>}
      />
      <ProductsList rows={rows.map((r) => ({ ...r, image: r.image?.url ?? null }))} subBrands={sbs} categories={cats} />
    </>
  );
}
