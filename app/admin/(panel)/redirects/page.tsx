import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { redirects } from '@/lib/db/schema';
import { PageHeader } from '@/components/admin/ui';
import { RedirectsEditor } from './RedirectsEditor';

export default async function RedirectsPage() {
  const rows = await db.select().from(redirects).orderBy(asc(redirects.fromPath));
  return (
    <>
      <PageHeader title="Pengalihan (redirect)" description="Arahkan alamat lama ke alamat baru (mis. setelah mengganti slug) agar pengunjung & Google tidak menemui halaman 404. Pengalihan otomatis dibuat saat Anda mengganti alamat halaman, produk, atau artikel yang sudah tayang." />
      <RedirectsEditor rows={rows.map((r) => ({ id: r.id, fromPath: r.fromPath, toPath: r.toPath, statusCode: r.statusCode, note: r.note ?? '' }))} />
    </>
  );
}
