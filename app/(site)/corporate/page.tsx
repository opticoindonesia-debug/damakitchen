import { notFound } from 'next/navigation';
import { PageBuilder } from '@/components/builder/PageBuilder';
import { builtInMetadata } from '@/lib/pageMeta';
import { getBuiltInPage } from '@/lib/cms';

export function generateMetadata() {
  return builtInMetadata('corporate', {
    title: 'Corporate: Nasi Kotak & Hampers Minang untuk Perusahaan',
    description:
      'Nasi kotak Minang DAMA KAPAU untuk acara kantor dan hampers TANDO MATO untuk klien maupun karyawan. Minta penawaran corporate lewat formulir atau WhatsApp.',
  });
}

export default async function CorporatePage() {
  const cms = await getBuiltInPage('corporate');
  if (!cms) notFound();
  return <PageBuilder sections={cms.sections} />;
}
