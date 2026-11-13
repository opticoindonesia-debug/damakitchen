import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { brandItems, faqs, testimonials } from '@/lib/db/schema';
import { PageHeader } from '@/components/admin/ui';
import { CollectionsEditor } from './CollectionsEditor';

export default async function CollectionsPage() {
  const [t, f, b] = await Promise.all([
    db.select().from(testimonials).orderBy(asc(testimonials.sortOrder), asc(testimonials.id)),
    db.select().from(faqs).orderBy(asc(faqs.sortOrder), asc(faqs.id)),
    db.select().from(brandItems).orderBy(asc(brandItems.sortOrder), asc(brandItems.id)),
  ]);
  return (
    <>
      <PageHeader title="Testimoni, FAQ & nilai" description='Isi untuk "Blok data otomatis" di halaman: testimoni, tanya jawab umum, pilar dan nilai brand.' />
      <CollectionsEditor
        data={{
          testimonials: t.map((r) => ({ id: r.id, title: r.name, subtitle: r.context, body: r.quote, visible: r.visible })),
          faqs: f.map((r) => ({ id: r.id, title: r.question, subtitle: r.groupKey, body: r.answer, visible: r.visible })),
          pillars: b.filter((r) => r.kind === 'pillar').map((r) => ({ id: r.id, title: r.title, subtitle: r.icon ?? '', body: r.body, visible: r.visible })),
          values: b.filter((r) => r.kind === 'value').map((r) => ({ id: r.id, title: r.title, subtitle: '', body: r.body, visible: r.visible })),
        }}
      />
    </>
  );
}
