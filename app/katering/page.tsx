import { Section } from '@/components/Section';
import { InquiryForm } from '@/components/InquiryForm';
import { ImageWithScrim } from '@/components/ImageWithScrim';
import { Reveal } from '@/components/Reveal';
import { buildMetadata } from '@/lib/seo';
import { media } from '@/content/site';

export const metadata = buildMetadata({
  title: 'Katering & Acara',
  description:
    'HIDANG BASAMO & DAMA KAPAU untuk acara Anda. Kami yang masak dan beres-beres, Anda yang hadir penuh.',
  path: '/katering',
});

const formats = [
  { title: 'Prasmanan', desc: 'Penyajian penuh untuk acara di rumah atau gedung, lengkap dengan peralatan saji.' },
  { title: 'Besek / Bento / Box', desc: 'Porsi individu yang rapi untuk dibagikan — praktis dan tetap terasa diniatkan.' },
  { title: '10–200 pax', desc: 'Skala kecil hingga acara besar, dengan standar dan porsi yang terjaga.' },
];

const proof = [
  { title: 'Tepat waktu', desc: 'Kami datang dan siap sesuai jadwal yang disepakati.' },
  { title: 'Porsi terjamin', desc: 'Jumlah dan porsi sesuai kesepakatan, tanpa kejutan.' },
  { title: 'Beres-beres', desc: 'Setelah acara, kami rapikan — Anda tinggal menikmati momennya.' },
];

export default function KateringPage() {
  return (
    <>
      <section className="border-b border-teal/10 bg-cream-deep py-section">
        <div className="container-dama grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-xl">
            <p className="text-label font-semibold uppercase tracking-[0.2em] text-terracotta-deep">
              Katering & Acara
            </p>
            <h1 className="mt-4 text-display-lg text-teal">
              Kami yang masak & beres-beres, Anda yang hadir penuh
            </h1>
            <p className="mt-6 text-body-lg text-ink-soft">
              Untuk acara di rumah maupun perayaan yang lebih besar — bersama HIDANG BASAMO dan
              DAMA KAPAU, Anda bisa benar-benar menemani tamu tanpa repot urusan dapur.
            </p>
          </div>
          <ImageWithScrim
            category="lifestyle"
            ratio="landscape"
            warmBorder
            priority
            src={media.kateringHero}
            sizes="(max-width: 1024px) 100vw, 600px"
            alt="Hidangan acara DAMA tersaji rapi di meja, suasana hangat menyambut tamu."
          />
        </div>
      </section>

      <Section eyebrow="Pilihan format" title="Sesuai bentuk acara Anda">
        <div className="grid gap-6 sm:grid-cols-3">
          {formats.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <div className="h-full rounded-lg border border-teal/10 bg-cream-paper p-7">
                <h3 className="font-display text-heading text-teal">{f.title}</h3>
                <p className="mt-2 text-caption text-ink-soft">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <section className="bg-teal py-section text-cream">
        <div className="container-dama">
          <h2 className="text-display-md">Yang bisa Anda andalkan</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {proof.map((p) => (
              <div key={p.title}>
                <h3 className="font-display text-heading text-gold">{p.title}</h3>
                <p className="mt-2 text-cream/80">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section
        eyebrow="Mulai dari obrolan"
        title="Minta penawaran acara"
        intro="Ceritakan sedikit tentang acara Anda. Kami siapkan penawaran dan lanjutkan lewat WhatsApp."
      >
        <div className="max-w-2xl">
          <InquiryForm variant="catering" />
        </div>
      </Section>
    </>
  );
}
