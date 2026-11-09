import { Section } from '@/components/Section';
import { ChannelMatrix } from '@/components/blocks/ChannelMatrix';
import { PageBuilder } from '@/components/builder/PageBuilder';
import { builtInMetadata } from '@/lib/pageMeta';
import { getBuiltInPage } from '@/lib/cms';

export function generateMetadata() {
  return builtInMetadata('pesan', {
    title: 'Di mana memesan',
    description:
      'Satu tempat untuk semua kanal DAMA — kanal mana untuk lini apa, lengkap dengan tautan langsung.',
  });
}

export default async function PesanPage() {
  const cms = await getBuiltInPage('pesan');
  if (cms) return <PageBuilder sections={cms.sections} />;

  return (
    <Section
      eyebrow="Di mana memesan"
      title="Pilih kanal sesuai kebutuhan"
      titleAs="h1"
      intro="Setiap lini punya kanal yang paling pas. Berikut panduan singkatnya — pilih yang paling nyaman untuk Anda."
    >
      <ChannelMatrix />
    </Section>
  );
}
