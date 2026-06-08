import Link from 'next/link';
import { Section } from '@/components/Section';
import { DiamondDivider } from '@/components/DiamondDivider';
import { Button } from '@/components/Button';
import { PatternBand } from '@/components/PatternBand';
import { ImageWithScrim } from '@/components/ImageWithScrim';
import { PillarRow } from '@/components/PillarRow';
import { SubBrandCard } from '@/components/SubBrandCard';
import { QuoteBlock } from '@/components/QuoteBlock';
import { ChannelButton } from '@/components/ChannelButton';
import { Reveal } from '@/components/Reveal';
import { Placeholder } from '@/components/Placeholder';
import { Testimonials } from '@/components/Testimonials';
import { enjoyModes } from '@/content/story';
import { cn } from '@/lib/utils';
import { getSubBrands, getPillars, getSiteSettings, getTestimonials } from '@/lib/cms';

// Curated, on-brand hero background presets (safe — contrast stays AA).
const heroStyles = {
  cream: { wrap: 'bg-cream', eyebrow: 'text-terracotta-deep', headline: 'text-teal', sub: 'text-ink-soft' },
  teal: { wrap: 'bg-teal', eyebrow: 'text-gold', headline: 'text-cream', sub: 'text-cream/80' },
  blush: { wrap: 'bg-blush/30', eyebrow: 'text-terracotta-deep', headline: 'text-teal', sub: 'text-ink-soft' },
} as const;

export default async function HomePage() {
  const [subBrandList, pillars, settings, testimonials] = await Promise.all([
    getSubBrands(),
    getPillars(),
    getSiteSettings(),
    getTestimonials(),
  ]);
  const hero = heroStyles[settings.heroStyle] ?? heroStyles.cream;
  return (
    <>
      {/* ── Hero (LCP) ─────────────────────────────────────── */}
      <section className={cn('relative overflow-hidden', hero.wrap)}>
        <PatternBand
          motif={settings.backgroundMotif}
          src={settings.motifImage}
          opacity={settings.motifOpacity}
        />
        <div className="container-dama relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="max-w-xl">
            <p className={cn('font-sans text-label font-semibold uppercase tracking-[0.2em]', hero.eyebrow)}>
              {settings.brandLineEn}
            </p>
            <h1 className={cn('mt-5 text-display-xl', hero.headline)}>{settings.heroHeadline}</h1>
            <p className={cn('mt-6 text-body-lg', hero.sub)}>{settings.umbrellaPromise}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button href="/pesan" size="lg">
                Pesan
              </Button>
              <Button href="/menu" variant="secondary" size="lg">
                Lihat Menu
              </Button>
            </div>
          </div>

          <ImageWithScrim
            category="food"
            ratio="square"
            warmBorder
            priority
            src={settings.heroImage}
            sizes="(max-width: 1024px) 100vw, 600px"
            alt="Sepiring rendang Minang yang dimasak perlahan, hangat dan menggugah selera di atas meja kayu."
            className="mx-auto w-full max-w-md lg:max-w-none"
          />
        </div>
      </section>

      {/* ── Essence strip ──────────────────────────────────── */}
      <section className="py-section">
        <div className="container-dama max-w-prose text-center">
          <p className="font-display text-display-md italic text-teal">{settings.essence}</p>
        </div>
        <DiamondDivider />
      </section>

      {/* ── Four pillars ───────────────────────────────────── */}
      <Section
        eyebrow="Yang kami pegang"
        title="Empat hal yang tak kami tawar"
        intro="Setiap hidangan DAMA lahir dari empat keyakinan yang sama."
      >
        <PillarRow pillars={pillars} />
      </Section>

      {/* ── Five sub-brands (navigational heart) ───────────── */}
      <Section
        id="lini"
        dividerAbove
        eyebrow="Lima lini, satu hati"
        title="Lima cara menikmati DAMA"
        intro="Masing-masing membawa suasana yang berbeda, namun voice-nya satu: hangat dan tulus."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subBrandList.map((sb, i) => (
            <Reveal key={sb.slug} delay={i * 0.06}>
              <SubBrandCard subBrand={sb} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Founder / heritage teaser ──────────────────────── */}
      <section className="bg-cream-deep py-section">
        <div className="container-dama grid items-center gap-12 lg:grid-cols-2">
          <ImageWithScrim
            category="process"
            ratio="landscape"
            warmBorder
            src={settings.founderImage}
            alt="Tangan menakar bumbu dengan teliti di dapur DAMA, uap masakan mengepul hangat."
          />
          <div>
            <QuoteBlock cite={`${settings.founderName}, ${settings.founderRole}`}>
              “{settings.founderQuote}”
            </QuoteBlock>
            <div className="mt-8">
              <Button href="/cerita" variant="ghost">
                Baca cerita kami →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── How to enjoy DAMA ──────────────────────────────── */}
      <Section
        eyebrow="Taraso Disayang"
        title="Cara menikmati DAMA"
        intro="Untuk diri sendiri, bersama keluarga, atau sebagai pemberian — DAMA hadir di setiap momen."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          {enjoyModes.map((mode, i) => (
            <Reveal key={mode.title} delay={i * 0.07}>
              <article className="flex h-full flex-col overflow-hidden rounded-lg border border-teal/10 bg-cream-paper">
                <Placeholder
                  category={mode.category}
                  ratio="landscape"
                  alt={`Suasana ${mode.title.toLowerCase()} bersama hidangan DAMA.`}
                />
                <div className="p-6">
                  <h3 className="font-display text-heading text-teal">{mode.title}</h3>
                  <p className="mt-2 text-caption text-ink-soft">{mode.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Testimonials ───────────────────────────────────── */}
      <Testimonials items={testimonials} />

      {/* ── Where to buy ───────────────────────────────────── */}
      <Section
        dividerAbove
        eyebrow="Di mana memesan"
        title="Temukan DAMA di kanal favorit Anda"
        intro="Kami hadir di tempat Anda biasa berbelanja. Pilih kanal yang paling nyaman."
      >
        <div className="flex flex-wrap gap-4">
          <ChannelButton channel="shopee" />
          <ChannelButton channel="tiktok" />
          <ChannelButton channel="whatsapp" />
          <ChannelButton channel="gofood" />
          <ChannelButton channel="grab" />
        </div>
        <p className="mt-6 text-caption text-ink-soft">
          Tidak yakin kanal mana untuk apa?{' '}
          <Link href="/pesan" className="text-teal underline underline-offset-4">
            Lihat panduan lengkapnya
          </Link>
          .
        </p>
      </Section>

      {/* ── Gifting + Catering dual CTA ────────────────────── */}
      <section className="container-dama pb-section">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-teal p-9 text-cream">
            <h3 className="font-display text-display-md">Punya acara?</h3>
            <p className="mt-3 max-w-sm text-cream/80">
              Kami yang masak dan beres-beres, Anda yang hadir penuh bersama tamu.
            </p>
            <div className="mt-7">
              <Button
                href="/katering"
                className="border border-cream/40 bg-transparent text-cream hover:bg-cream/10"
              >
                Minta penawaran acara
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-terracotta p-9 text-cream">
            <h3 className="font-display text-display-md">Ingin memberi?</h3>
            <p className="mt-3 max-w-sm text-cream/85">
              Kirim rasa sayang lewat hampers yang dirangkai dengan hati.
            </p>
            <div className="mt-7">
              <Button
                href="/hadiah"
                className="border border-cream/50 bg-cream text-terracotta-deep hover:bg-cream-paper"
              >
                Kirim sebagai hadiah
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
