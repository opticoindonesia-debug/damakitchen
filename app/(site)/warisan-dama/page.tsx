import { notFound } from 'next/navigation';
import { SubBrandPage } from '@/components/SubBrandPage';
import { buildMetadata } from '@/lib/seo';
import { getSubBrand } from '@/lib/cms';

const SLUG = 'warisan-dama' as const;

export async function generateMetadata() {
  const sb = await getSubBrand(SLUG);
  if (!sb) return buildMetadata({ title: 'Lini', description: '', path: `/${SLUG}` });
  return buildMetadata({ title: sb.name, description: sb.lead, path: `/${sb.slug}` });
}

export default async function Page() {
  const sb = await getSubBrand(SLUG);
  // Jika sub-brand dihapus di Studio, halamannya ikut hilang (404).
  if (!sb) notFound();
  return <SubBrandPage subBrand={sb} />;
}
