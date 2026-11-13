import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { subBrands } from '@/lib/db/schema';
import { LinkButton, PageHeader } from '@/components/admin/ui';
import { SubBrandsList } from './SubBrandsList';

export default async function SubBrandsIndex() {
  const rows = await db
    .select({ id: subBrands.id, name: subBrands.name, slug: subBrands.slug, enabled: subBrands.enabled, markerHex: subBrands.markerHex, emotion: subBrands.emotion })
    .from(subBrands)
    .orderBy(asc(subBrands.sortOrder), asc(subBrands.id));
  return (
    <>
      <PageHeader
        title="Sub-brand"
        description="LAMAK DAMA, WARISAN DAMA, HIDANG BASAMO, DAMA KAPAU, TANDO MATO. Sub-brand yang disembunyikan tidak tampil di menu, footer, sitemap, maupun halamannya."
        actions={<LinkButton href="/admin/sub-brands/new" variant="primary">+ Sub-brand baru</LinkButton>}
      />
      <SubBrandsList rows={rows} />
    </>
  );
}
