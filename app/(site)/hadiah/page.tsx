import { Section } from '@/components/Section';
import { InquiryForm } from '@/components/InquiryForm';
import { ImageWithScrim } from '@/components/ImageWithScrim';
import { ChannelButton } from '@/components/ChannelButton';
import { Reveal } from '@/components/Reveal';
import { PatternBand } from '@/components/PatternBand';
import { buildMetadata } from '@/lib/seo';
import { getProductsBySubBrand, getSiteSettings } from '@/lib/cms';
import { site, media } from '@/content/site';

export const metadata = buildMetadata({
  title: 'Hadiah',
  description:
    'TANDO MATO — hampers masakan Minang untuk momen berkesan. Hadiah personal, corporate gifting, dengan kartu tulisan tangan.',
  path: '/hadiah',
});

const tierMeta: Record<string, string> = {
  'tando-si-ketek': '1 porsi',
  'tando-si-sedang': '2–3 porsi',
  'tando-si-gadang': '5–8 porsi',
};

export default async function HadiahPage() {
  const [tiers, settings] = await Promise.all([
    getProductsBySubBrand('tando-mato'),
    getSiteSettings(),
  ]);
  const seasonal = settings.seasonal;
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

      {seasonal.active && (
        <div className="border-b border-songketRed/20 bg-songketRed/10">
          <div className="container-dama flex flex-wrap items-center gap-x-3 gap-y-1 py-4">
            <span className="text-label font-semibold uppercase tracking-[0.16em] text-songketRed">
              {seasonal.label}
            </span>
            <span className="text-caption text-ink">{seasonal.message}</span>
          </div>
        </div>
      )}

      <Section eyebrow="Pilihan paket" title="Dari Si Ketek hingga Si Gadang">
        <div className="grid gap-6 sm:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.07}>
              <article className="flex h-full flex-col overflow-hidden rounded-lg border border-teal/10 bg-cream-paper shadow-soft">
                <ImageWithScrim
                  category="product"
                  ratio="landscape"
                  rounded={false}
                  src={t.image}
                  alt={`Hampers ${t.name} dari TANDO MATO — ${t.blurb}`}
                />
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-label uppercase tracking-[0.14em] text-ink-soft">
                    {tierMeta[t.id] ?? ''}
                  </span>
                  <h3 className="mt-1 font-display text-heading text-teal">{t.name}</h3>
                  <p className="mt-2 flex-1 text-caption text-ink-soft">{t.blurb}</p>
                  {/* TODO: real price per tier. */}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
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
