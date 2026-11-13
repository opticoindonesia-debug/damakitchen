import { notFound } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productCategories, products, subBrands } from '@/lib/db/schema';
import { ProductEditor, type ProductForm } from './ProductEditor';

const EMPTY: ProductForm = {
  name: '',
  slug: '',
  subBrandId: null,
  categoryId: null,
  blurb: '',
  description: '',
  price: '',
  priceNote: '',
  availability: 'available',
  status: 'draft',
  image: undefined,
  gallery: [],
  info: [],
  imageCategory: 'food',
  orderLinks: [],
  ingredients: '',
  serving: '',
  storage: '',
  preparation: '',
  seo: {},
};

export default async function EditProduct({ params }: { params: { id: string } }) {
  const [sbs, cats] = await Promise.all([
    db.select({ id: subBrands.id, name: subBrands.name }).from(subBrands).orderBy(asc(subBrands.sortOrder)),
    db.select({ id: productCategories.id, name: productCategories.name }).from(productCategories).orderBy(asc(productCategories.sortOrder)),
  ]);
  if (params.id === 'new') return <ProductEditor id={null} initial={EMPTY} subBrands={sbs} categories={cats} />;
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!p) notFound();
  const initial: ProductForm = {
    name: p.name,
    slug: p.slug,
    subBrandId: p.subBrandId,
    categoryId: p.categoryId,
    blurb: p.blurb,
    description: p.description ?? '',
    price: p.price == null ? '' : String(p.price),
    priceNote: p.priceNote ?? '',
    availability: p.availability,
    status: p.status,
    image: p.image ?? undefined,
    gallery: p.gallery ?? [],
    info: p.info ?? [],
    imageCategory: p.imageCategory,
    orderLinks: p.orderLinks ?? [],
    ingredients: p.ingredients ?? '',
    serving: p.serving ?? '',
    storage: p.storage ?? '',
    preparation: p.preparation ?? '',
    seo: p.seo ?? {},
  };
  return <ProductEditor id={p.id} initial={initial} subBrands={sbs} categories={cats} />;
}
