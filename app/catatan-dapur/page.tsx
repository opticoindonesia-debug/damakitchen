import { Section } from '@/components/Section';
import { DiamondDivider } from '@/components/DiamondDivider';
import { Button } from '@/components/Button';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Catatan Dapur',
  description: 'Cerita kecil dari dapur DAMA — segera hadir.',
  path: '/catatan-dapur',
});

export default function CatatanDapurPage() {
  return (
    <Section eyebrow="Catatan Dapur" title="Cerita kecil dari dapur kami" titleAs="h1">
      <div className="max-w-prose">
        <p className="text-body-lg text-ink-soft">
          Di sini nantinya kami berbagi cerita di balik masakan — resep yang dijaga, bahan yang
          dipilih, dan orang-orang yang membuat DAMA terasa seperti rumah.
        </p>
        <DiamondDivider />
        <div className="rounded-lg border border-teal/10 bg-cream-paper p-8 text-center">
          <p className="font-display text-heading text-teal">Segera hadir</p>
          <p className="mt-2 text-caption text-ink-soft">
            Sambil menunggu, mari berkenalan lewat cerita kami.
          </p>
          <div className="mt-5 flex justify-center">
            <Button href="/cerita" variant="secondary">
              Baca cerita DAMA
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
