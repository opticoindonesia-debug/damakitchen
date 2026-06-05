import { Section } from '@/components/Section';
import { DiamondDivider } from '@/components/DiamondDivider';
import { QuoteBlock } from '@/components/QuoteBlock';
import { ImageWithScrim } from '@/components/ImageWithScrim';
import { PillarRow } from '@/components/PillarRow';
import { Button } from '@/components/Button';
import { Reveal } from '@/components/Reveal';
import { buildMetadata } from '@/lib/seo';
import { founder, proverbMovements } from '@/content/story';
import { values } from '@/content/values';
import { site } from '@/content/site';

export const metadata = buildMetadata({
  title: 'Cerita',
  description:
    'Cerita DAMA: dari dapur keluarga, warisan Minang, dan keyakinan bahwa masakan adalah cara merawat hubungan.',
  path: '/cerita',
});

export default function CeritaPage() {
  return (
    <>
      {/* Founder's truth */}
      <section className="py-section">
        <div className="container-dama grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-xl">
            <p className="text-label font-semibold uppercase tracking-[0.2em] text-terracotta-deep">
              Cerita kami
            </p>
            <h1 className="mt-4 text-display-lg text-teal">
              Bermula dari dapur, untuk yang disayang
            </h1>
            {founder.truth.map((para) => (
              <p key={para} className="mt-5 text-body-lg text-ink-soft">
                {para}
              </p>
            ))}
          </div>
          <ImageWithScrim
            category="lifestyle"
            ratio="portrait"
            warmBorder
            priority
            alt={`${founder.name}, pendiri DAMA, di dapur yang hangat dan penuh cerita.`}
            className="mx-auto w-full max-w-sm"
          />
        </div>
      </section>

      <div className="container-dama">
        <QuoteBlock cite={`${founder.name}, ${founder.role}`} className="mx-auto max-w-3xl">
          “{founder.pullQuote}”
        </QuoteBlock>
      </div>

      {/* The proverb */}
      <Section
        dividerAbove
        eyebrow="Akar kami"
        title="Dari Mato Turun Ka Paruik"
        intro="Peribahasa Minang yang menjadi inti DAMA — apa yang dilihat dan dirasakan, turun menjadi niat, lalu menjadi masakan."
      >
        <div className="grid gap-8 sm:grid-cols-3">
          {proverbMovements.map((m, i) => (
            <Reveal key={m.title} delay={i * 0.08}>
              <div className="rounded-lg border border-teal/10 bg-cream-paper p-7">
                <span className="font-display text-display-md text-terracotta">{i + 1}</span>
                <h3 className="mt-2 font-display text-heading text-teal">{m.title}</h3>
                <p className="mt-2 text-caption text-ink-soft">{m.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Four pillars expanded */}
      <section className="bg-cream-deep py-section">
        <div className="container-dama">
          <header className="mb-12 max-w-prose">
            <p className="text-label font-semibold uppercase tracking-[0.18em] text-terracotta-deep">
              Yang kami pegang
            </p>
            <h2 className="mt-3 text-display-md text-teal">Empat pilar DAMA</h2>
          </header>
          <PillarRow />
        </div>
      </section>

      {/* Five values */}
      <Section eyebrow="Cara kami bekerja" title="Lima nilai yang kami jaga">
        <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {values.map((v, i) => (
            <Reveal as="li" key={v.title} delay={(i % 2) * 0.06}>
              <h3 className="font-display text-heading text-teal">{v.title}</h3>
              <p className="mt-2 max-w-md text-body text-ink-soft">{v.desc}</p>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* Gentle closing invite — no hard CTA stack */}
      <section className="container-dama pb-section">
        <DiamondDivider tone="terracotta" />
        <div className="mx-auto max-w-prose text-center">
          <p className="font-display text-display-md italic text-teal">
            {site.umbrellaPromise}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/menu" variant="secondary">
              Lihat menu
            </Button>
            <Button href="/pesan">Pesan</Button>
          </div>
        </div>
      </section>
    </>
  );
}
