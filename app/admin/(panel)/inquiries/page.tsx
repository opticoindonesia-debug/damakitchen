import { desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { inquiries } from '@/lib/db/schema';
import { PageHeader } from '@/components/admin/ui';
import { InquiriesList } from './InquiriesList';

export default async function InquiriesPage() {
  const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(300);
  return (
    <>
      <PageHeader
        title="Permintaan masuk"
        description="Semua permintaan dari formulir katering, hadiah dan corporate. Pengunjung juga diarahkan ke WhatsApp, jadi cek juga chat WhatsApp. Data pribadi: gunakan hanya untuk menindaklanjuti, hapus bila tidak diperlukan lagi."
      />
      <InquiriesList rows={rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() }))} />
    </>
  );
}
