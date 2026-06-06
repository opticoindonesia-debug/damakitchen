import { SubBrandPage } from '@/components/SubBrandPage';
import { buildMetadata } from '@/lib/seo';
import { getSubBrand } from '@/lib/cms';
import { subBrands } from '@/content/subbrands';

const SLUG = 'tando-mato' as const;

export async function generateMetadata() {
  const sb = (await getSubBrand(SLUG)) ?? subBrands[SLUG];
  return buildMetadata({ title: sb.name, description: sb.lead, path: `/${sb.slug}` });
}

export default async function Page() {
  const sb = (await getSubBrand(SLUG)) ?? subBrands[SLUG];
  return <SubBrandPage subBrand={sb} />;
}
