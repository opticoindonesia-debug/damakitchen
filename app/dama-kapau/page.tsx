import { SubBrandPage } from '@/components/SubBrandPage';
import { buildMetadata } from '@/lib/seo';
import { subBrands } from '@/content/subbrands';

const sb = subBrands['dama-kapau'];

export const metadata = buildMetadata({
  title: sb.name,
  description: sb.lead,
  path: `/${sb.slug}`,
});

export default function Page() {
  return <SubBrandPage subBrand={sb} />;
}
