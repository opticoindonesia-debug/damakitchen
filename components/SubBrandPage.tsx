import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section } from './Section';
import { DiamondDivider } from './DiamondDivider';
import { ImageWithScrim } from './ImageWithScrim';
import { ProductCard } from './ProductCard';
import { ChannelButton } from './ChannelButton';
import { FAQAccordion } from './FAQAccordion';
import { Reveal } from './Reveal';
import { hexToRgbTriple } from '@/lib/utils';
import { subBrands, type SubBrand } from '@/content/subbrands';
import { productsBySubBrand } from '@/content/products';
import { site } from '@/content/site';

/**
 * Single data-driven sub-brand template (§7.3). The page accent is the line's
 * marker color (set on --accent); everything else stays in the core palette.
 */
export function SubBrandPage({ subBrand }: { subBrand: SubBrand }) {
  const lineProducts = productsBySubBrand(subBrand.slug);
  const accentStyle = { '--accent': hexToRgbTriple(subBrand.markerHex) } as React.CSSProperties;

  return (
    <div style={accentStyle}>
      {/* ── Marker-tinted hero ──────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-teal/10 bg-cream-deep">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: subBrand.markerHex }}
        />
        <div className="container-dama grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-20">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: subBrand.markerHex }}
                aria-hidden="true"
              />
              <span className="text-label font-semibold uppercase tracking-[0.18em] text-ink-soft">
                {subBrand.emotion}
              </span>
            </div>
            <h1 className="mt-4 text-display-lg text-teal">{subBrand.name}</h1>
            <p className="mt-1 font-display italic text-ink-soft">
              {site.tagline} · by DAMA
            </p>
            <p className="mt-6 text-body-lg text-ink">{subBrand.lead}</p>
          </div>
          <ImageWithScrim
            category="food"
            ratio="landscape"
            warmBorder
            priority
            alt={`Hidangan khas ${subBrand.name} disajikan hangat — ${subBrand.emotion.toLowerCase()} dan menggugah selera.`}
          />
        </div>
      </section>

      {/* ── What it is / who it's for ───────────────────────── */}
      <Section eyebrow="Tentang lini ini" title={`Apa itu ${subBrand.name}`}>
        <p className="max-w-prose text-body-lg text-ink-soft">{subBrand.about}</p>
      </Section>

      {/* ── Product list ────────────────────────────────────── */}
      {lineProducts.length > 0 && (
        <Section dividerAbove eyebrow="Pilihan hidangan" title="Yang bisa Anda nikmati">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lineProducts.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.05}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* ── How to order ────────────────────────────────────── */}
      <section className="bg-cream-deep py-section">
        <div className="container-dama max-w-prose">
          <h2 className="text-display-md text-teal">Cara memesan</h2>
          <p className="mt-4 text-body-lg text-ink-soft">{subBrand.howToOrder}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            {subBrand.slug === 'hidang-basamo' ? (
              <>
                <Link
                  href="/katering"
                  className="inline-flex min-h-[44px] items-center rounded bg-terracotta px-6 py-3 font-medium text-cream transition-colors duration-300 hover:bg-terracotta-80"
                >
                  Minta penawaran acara
                </Link>
                <ChannelButton channel="whatsapp" />
              </>
            ) : (
              subBrand.channels.map((c) => <ChannelButton key={c} channel={c} />)
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <Section eyebrow="Hal yang sering ditanya" title="Sejujurnya, begini">
        <div className="max-w-prose">
          <FAQAccordion items={subBrand.faqs} />
        </div>
      </Section>

      {/* ── Cross-sell strip ────────────────────────────────── */}
      <section className="container-dama pb-section">
        <DiamondDivider />
        <p className="mb-6 text-label font-semibold uppercase tracking-[0.18em] text-terracotta-deep">
          Mungkin juga cocok…
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          {subBrand.crossSell.map((slug) => {
            const sib = subBrands[slug];
            return (
              <Link
                key={slug}
                href={`/${sib.slug}`}
                className="group flex items-center justify-between gap-4 rounded-lg border border-teal/10 bg-cream-paper p-6 transition-transform duration-300 ease-calm hover:-translate-y-0.5"
                style={{ borderLeftColor: sib.markerHex, borderLeftWidth: 3 }}
              >
                <div>
                  <h3 className="font-display text-heading text-teal">{sib.name}</h3>
                  <p className="mt-1 text-caption text-ink-soft">{sib.lead}</p>
                </div>
                <ArrowRight
                  size={20}
                  className="shrink-0 text-terracotta transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
