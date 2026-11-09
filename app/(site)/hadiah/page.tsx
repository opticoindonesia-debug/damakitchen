import { Section } from '@/components/Section';
import { InquiryForm } from '@/components/InquiryForm';
import { ImageWithScrim } from '@/components/ImageWithScrim';
import { ChannelButton } from '@/components/ChannelButton';
import { PatternBand } from '@/components/PatternBand';
import { builtInMetadata } from '@/lib/pageMeta';
import { PageBuilder } from '@/components/builder/PageBuilder';
import { getBuiltInPage } from '@/lib/cms';
import { GiftTiers } from '@/components/blocks/GiftTiers';
import { SeasonalBanner } from '@/components/blocks/SeasonalBanner';
import { site, media } from '@/content/site';

export function generateMetadata() {
  return builtInMetadata('hadiah', {
  title: 'Hadiah',
  description:
    'TANDO MATO — hampers masakan Minang untuk momen berkesan. Hadiah personal, corporate gifting, dengan kartu tulisan tangan.',
  });
}

export default async function HadiahPage() {
  const cms = await getBuiltInPage('hadiah');
  if (cms) return <PageBuilder sections={cms.sections} />;

  return (
    <>
      <section className="relative overflow-hidden border-b border-teal/10 bg-blush/30 py-section">
        <PatternBand motif="bunga-floral" opacity={0.07} />
        <div className="container-dama relative grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-xl">
            <p className="text-label font-semibold uppercase tracking-[0.2em] text-terracotta-deep">
              TANDO MATO · Hadiah
            </p>
            <h1 className="mt-4 text-display-lg text-teal">Kirim rasa sayang, bukan sekadar makanan</h1>
            <p className="mt-6 text-body-lg text-ink-soft">
              Hampers masakan Minang yang dirangkai rapi dan dilengkapi kartu — supaya yang Anda
              kirim terasa sebagai tando mato: tanda mata yang tulus.
            </p>
          </div>
          <ImageWithScrim
            category="product"
            ratio="landscape"
            warmBorder
            priority
            src={media.giftingHero}
            sizes="(max-width: 1024px) 100vw, 600px"
            alt="Hampers TANDO MATO yang dirangkai rapi dengan kartu ucapan, hangat dan personal."
          />
        </div>
      </section>

      <SeasonalBanner />

      <Section eyebrow="Pilihan paket" title="Dari Si Ketek hingga Si Gadang">
        <GiftTiers />
      </Section>

      <section className="bg-cream-deep py-section">
        <div className="container-dama grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-display-md text-teal">Corporate gifting</h2>
            <p className="mt-4 max-w-prose text-body-lg text-ink-soft">
              Untuk pemberian dalam jumlah banyak, kami bantu rancang paket, kartu, dan pengiriman —
              supaya setiap penerima merasa benar-benar diperhatikan.
            </p>
            <div className="mt-6">
              <ChannelButton channel="whatsapp" />
            </div>
          </div>
          <div>
            <h2 className="text-display-md text-teal">Kartu tulisan tangan</h2>
            <p className="mt-4 max-w-prose text-body-lg text-ink-soft">
              Titipkan pesan Anda, kami tuliskan dengan tangan dan sertakan di dalam hampers. Sentuhan
              kecil yang membuat momen lebih berkesan.
            </p>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Rancang bersama"
        title="Kirim sebagai hadiah"
        intro="Ceritakan paket dan momen yang Anda tuju. Untuk paket musiman, tersedia juga di Shopee."
      >
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="max-w-2xl">
            <InquiryForm variant="gifting" />
          </div>
          <aside className="rounded-lg border border-teal/10 bg-cream-paper p-7">
            <h3 className="font-display text-heading text-teal">Lebih suka langsung?</h3>
            <p className="mt-2 text-caption text-ink-soft">
              Paket musiman {site.tagline} tersedia di Shopee.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <ChannelButton channel="shopee" fullWidth />
              <ChannelButton channel="whatsapp" fullWidth />
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
