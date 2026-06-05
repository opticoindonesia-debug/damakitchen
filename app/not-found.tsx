import { Section } from '@/components/Section';
import { Button } from '@/components/Button';

export default function NotFound() {
  return (
    <Section eyebrow="404" title="Sepertinya halaman ini tak ada di meja">
      <div className="max-w-prose">
        <p className="text-body-lg text-ink-soft">
          Mungkin tautannya berubah. Mari kembali dan temukan apa yang Anda cari.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/">Kembali ke beranda</Button>
          <Button href="/menu" variant="secondary">
            Lihat menu
          </Button>
        </div>
      </div>
    </Section>
  );
}
