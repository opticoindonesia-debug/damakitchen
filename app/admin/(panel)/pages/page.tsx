import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { PageHeader } from '@/components/admin/ui';
import { PagesList } from './PagesList';

export default async function PagesIndex() {
  const rows = await db
    .select({ id: pages.id, title: pages.title, slug: pages.slug, builtinKey: pages.builtinKey, status: pages.status, hasChanges: pages.hasChanges, updatedAt: pages.updatedAt })
    .from(pages)
    .orderBy(asc(pages.sortOrder), asc(pages.id));
  return (
    <>
      <PageHeader title="Halaman" description="Setiap halaman tersusun dari bagian-bagian (hero, teks, galeri, produk, FAQ, dll.) yang bisa Anda tambah, ubah, sembunyikan, dan urutkan." />
      <PagesList rows={rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString() }))} />
    </>
  );
}
