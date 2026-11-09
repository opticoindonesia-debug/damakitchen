import { Section } from '@/components/Section';
import { ContactDetails } from '@/components/blocks/ContactDetails';
import { PageBuilder } from '@/components/builder/PageBuilder';
import { builtInMetadata } from '@/lib/pageMeta';
import { getBuiltInPage } from '@/lib/cms';

export function generateMetadata() {
  return builtInMetadata('kontak', {
    title: 'Kontak',
    description: 'Sapa DAMA lewat WhatsApp, email, atau media sosial. Kami senang mendengar dari Anda.',
  });
}

export default async function KontakPage() {
  const cms = await getBuiltInPage('kontak');
  if (cms) return <PageBuilder sections={cms.sections} />;

  return (
    <Section
      eyebrow="Kontak"
      title="Senang bisa menyapa Anda"
      titleAs="h1"
      intro="Cara tercepat menghubungi kami adalah lewat WhatsApp. Bisa juga lewat email atau media sosial."
    >
      <ContactDetails />
    </Section>
  );
}
