import { ImageWithScrim } from '@/components/ImageWithScrim';
import { RichText } from '@/components/RichText';
import { ContactDetails } from '@/components/blocks/ContactDetails';
import { QuoteBlock } from '@/components/QuoteBlock';
import { Reveal } from '@/components/Reveal';
import { FAQAccordion } from '@/components/FAQAccordion';
import { InquiryForm } from '@/components/InquiryForm';
import { ChannelButton } from '@/components/ChannelButton';
import { DiamondDivider } from '@/components/DiamondDivider';
import { infoIconMap, pillarIconMap } from '@/components/icons';
import type { ChannelId } from '@/content/channels';
import { cn } from '@/lib/utils';
import {
  BuilderButtons,
  SectionHeader,
  SectionShell,
  SmartLink,
  bgOf,
  paragraphs,
  resolveLink,
  toneOf,
  type ButtonValue,
  type HeadingTag,
  type SectionStyle,
} from './shell';

type Img = { url?: string; alt?: string; caption?: string; _key?: string } | undefined;
type Ratio = 'landscape' | 'portrait' | 'square' | 'wide';
const ratioOf = (v: unknown, fallback: Ratio): Ratio =>
  v === 'landscape' || v === 'portrait' || v === 'square' || v === 'wide' ? v : fallback;

const GRID_COLS: Record<number, string> = {
  1: '',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};
const cols = (n: unknown, fallback = 3) => GRID_COLS[typeof n === 'number' ? n : fallback] ?? GRID_COLS[3];

interface Base extends SectionStyle {
  eyebrow?: string;
  heading?: string;
  intro?: string;
}

/** Mobile photo placement for hero (image is after the text in the DOM). */
function mobileImageCls(v: unknown, left: boolean) {
  if (v === 'hidden') return 'hidden lg:block';
  if (v === 'before') return left ? 'order-first' : 'order-first lg:order-none';
  return left ? 'order-last lg:order-first' : '';
}
/** Mobile photo placement for photo+text (image is before the text in the DOM). */
function splitMobileCls(v: unknown, right: boolean) {
  if (v === 'hidden') return 'hidden lg:block';
  if (v === 'after') return right ? 'order-last' : 'order-last lg:order-none';
  return ''; // default: photo above the text on phones (original layout)
}

// ── Hero ──────────────────────────────────────────────────────
export function HeroBlock({ s, headingAs }: { s: Base & Record<string, unknown>; headingAs: HeadingTag }) {
  const bg = bgOf(s.background);
  const t = toneOf(bg);
  const image = s.image as Img;
  const position = (s.imagePosition as string) ?? 'right';
  const withImage = position !== 'none';
  const H = headingAs;
  return (
    <SectionShell s={s}>
      <div className={cn('container-dama grid items-center gap-12', withImage && 'lg:grid-cols-2')}>
        <div className={cn('max-w-xl', !withImage && 'max-w-3xl')}>
          {s.eyebrow && (
            <p className={cn('font-sans text-label font-semibold uppercase tracking-[0.2em]', t.eyebrow)}>
              {s.eyebrow}
            </p>
          )}
          <H
            className={cn(
              'mt-5',
              s.headingSize === 'xlarge' ? 'text-display-xl' : 'text-display-lg',
              t.heading,
            )}
          >
            {s.heading}
          </H>
          {paragraphs(s.text as string).map((p, i) => (
            <p key={i} className={cn('mt-6 text-body-lg', t.muted)}>
              {p}
            </p>
          ))}
          <BuilderButtons buttons={s.buttons as ButtonValue[]} bg={bg} className="mt-9" />
        </div>
        {withImage && (
          <ImageWithScrim
            category="food"
            ratio={ratioOf(s.imageRatio, 'landscape')}
            warmBorder
            priority
            src={image?.url}
            sizes="(max-width: 1024px) 100vw, 600px"
            alt={image?.alt || s.heading || 'Foto DAMA KITCHEN'}
            className={cn('mx-auto w-full max-w-md lg:max-w-none', position === 'left' && 'lg:order-first', mobileImageCls(s.mobileImage, position === 'left'))}
          />
        )}
      </div>
    </SectionShell>
  );
}

// ── Text ──────────────────────────────────────────────────────
export function TextBlock({ s, headingAs }: { s: Base & Record<string, unknown>; headingAs: HeadingTag }) {
  const bg = bgOf(s.background);
  const t = toneOf(bg);
  const align = s.align === 'center' ? 'center' : 'left';
  return (
    <SectionShell s={s}>
      <div className={cn('container-dama', align === 'center' && 'flex flex-col items-center')}>
        <SectionHeader eyebrow={s.eyebrow} heading={s.heading} as={headingAs} t={t} align={align} />
        <div className={cn('max-w-prose', align === 'center' && 'mx-auto')}>
          <RichText html={s.body} tone={t.tone} align={align} />
        </div>
        <BuilderButtons
          buttons={s.buttons as ButtonValue[]}
          bg={bg}
          className={cn('mt-6', align === 'center' && 'justify-center')}
        />
      </div>
    </SectionShell>
  );
}

// ── Photo + text ──────────────────────────────────────────────
export function SplitBlock({ s, headingAs }: { s: Base & Record<string, unknown>; headingAs: HeadingTag }) {
  const bg = bgOf(s.background);
  const t = toneOf(bg);
  const image = s.image as Img;
  return (
    <SectionShell s={s}>
      <div className="container-dama grid items-center gap-12 lg:grid-cols-2">
        <ImageWithScrim
          category="process"
          ratio={ratioOf(s.imageRatio, 'landscape')}
          warmBorder
          src={image?.url}
          alt={image?.alt || s.heading || 'Foto DAMA KITCHEN'}
          className={cn(s.imagePosition === 'right' && 'lg:order-last', splitMobileCls(s.mobileImage, s.imagePosition === 'right'))}
        />
        <div>
          <SectionHeader eyebrow={s.eyebrow} heading={s.heading} as={headingAs} t={t} />
          <RichText html={s.body} tone={t.tone} />
          <BuilderButtons buttons={s.buttons as ButtonValue[]} bg={bg} className="mt-6" />
        </div>
      </div>
    </SectionShell>
  );
}

// ── Quote ─────────────────────────────────────────────────────
export function QuoteSectionBlock({ s }: { s: Base & Record<string, unknown> }) {
  const bg = bgOf(s.background);
  const t = toneOf(bg);
  const image = s.image as Img;
  const quote = s.quote as string;
  const cite = s.attribution as string | undefined;

  // Side photo when chosen (shows a warm placeholder until a photo is uploaded)
  // or whenever a photo exists.
  if (s.layout === 'withImage' || image?.url) {
    return (
      <SectionShell s={s}>
        <div className="container-dama grid items-center gap-12 lg:grid-cols-2">
          <ImageWithScrim
            category="process"
            ratio="landscape"
            warmBorder
            src={image?.url}
            alt={image?.alt || cite || 'Foto DAMA KITCHEN'}
            className={cn(s.imagePosition === 'right' && 'lg:order-last')}
          />
          <div>
            <QuoteBlock cite={cite} tone={t.dark ? 'cream' : 'teal'}>
              “{quote}”
            </QuoteBlock>
            <BuilderButtons buttons={s.buttons as ButtonValue[]} bg={bg} className="mt-8" />
          </div>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell s={s}>
      <div className="container-dama max-w-prose">
        <figure className="text-center">
          <blockquote className={cn('font-display text-display-md italic', t.heading)}>{quote}</blockquote>
          {cite && <figcaption className={cn('mt-4 text-caption', t.muted)}>— {cite}</figcaption>}
        </figure>
        <BuilderButtons buttons={s.buttons as ButtonValue[]} bg={bg} className="mt-8 justify-center" />
      </div>
    </SectionShell>
  );
}

// ── Cards ─────────────────────────────────────────────────────
type Card = { _key?: string; image?: Img; title?: string; text?: string; linkLabel?: string; link?: string };

export function CardsBlock({ s, headingAs }: { s: Base & Record<string, unknown>; headingAs: HeadingTag }) {
  const bg = bgOf(s.background);
  const t = toneOf(bg);
  const style = (s.cardStyle as string) ?? 'image';
  const cards = (s.cards as Card[]) ?? [];
  return (
    <SectionShell s={s}>
      <div className="container-dama">
        <SectionHeader eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} as={headingAs} t={t} />
        <div className={cn('grid gap-6', cols(s.columns))}>
          {cards.map((c, i) => {
            const href = resolveLink(c.link);
            return (
              <Reveal key={c._key ?? i} delay={(i % 3) * 0.07}>
                <article className={cn('flex h-full flex-col overflow-hidden rounded-lg border', t.card)}>
                  {style === 'image' && (
                    <ImageWithScrim
                      category="lifestyle"
                      ratio="landscape"
                      rounded={false}
                      src={c.image?.url}
                      alt={c.image?.alt || c.title || 'Foto DAMA KITCHEN'}
                    />
                  )}
                  <div className={cn('flex flex-1 flex-col', style === 'image' ? 'p-6' : 'p-7')}>
                    {style === 'numbered' && (
                      <span className={cn('font-display text-display-md', t.accentText)}>{i + 1}</span>
                    )}
                    {c.title && <h3 className={cn('font-display text-heading', t.cardHeading)}>{c.title}</h3>}
                    {c.text && <p className={cn('mt-2 flex-1 text-caption', t.cardText)}>{c.text}</p>}
                    {href && (
                      <SmartLink href={href} className={cn('mt-4 text-caption font-medium', t.link)}>
                        {c.linkLabel || 'Selengkapnya'} →
                      </SmartLink>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

// ── Features (icon list) ──────────────────────────────────────
type Feature = { _key?: string; icon?: string; title?: string; text?: string; linkLabel?: string; link?: string };
const ICONS: Record<string, (p: { width: number; height: number }) => JSX.Element> = {
  ...pillarIconMap,
  ...infoIconMap,
};

export function FeaturesBlock({ s, headingAs }: { s: Base & Record<string, unknown>; headingAs: HeadingTag }) {
  const bg = bgOf(s.background);
  const t = toneOf(bg);
  const items = (s.items as Feature[]) ?? [];
  return (
    <SectionShell s={s}>
      <div className="container-dama">
        <SectionHeader eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} as={headingAs} t={t} />
        <ul className={cn('grid gap-10', cols(s.columns))}>
          {items.map((f, i) => {
            const Icon = f.icon && f.icon !== 'none' ? ICONS[f.icon] : undefined;
            const href = resolveLink(f.link);
            return (
              <Reveal as="li" key={f._key ?? i} delay={(i % 4) * 0.07}>
                {Icon && (
                  <div className={t.accentText}>
                    <Icon width={32} height={32} />
                  </div>
                )}
                {f.title && (
                  <h3 className={cn('font-display text-heading', Icon && 'mt-4', t.featureTitle)}>{f.title}</h3>
                )}
                {f.text && <p className={cn('mt-2', t.muted)}>{f.text}</p>}
                {href && (
                  <SmartLink href={href} className={cn('mt-4 inline-block text-caption font-medium', t.link)}>
                    {f.linkLabel || 'Selengkapnya'} →
                  </SmartLink>
                )}
              </Reveal>
            );
          })}
        </ul>
      </div>
    </SectionShell>
  );
}

// ── CTA panels ────────────────────────────────────────────────
type Panel = { _key?: string; heading?: string; text?: string; buttonLabel?: string; link?: string; tone?: string };
const PANEL: Record<string, { box: string; heading: string; text: string; button: string }> = {
  primary: {
    box: 'bg-teal text-cream',
    heading: 'text-cream',
    text: 'text-cream/80',
    button: 'border border-cream/40 bg-transparent text-cream hover:bg-cream/10',
  },
  accent: {
    box: 'bg-terracotta text-cream',
    heading: 'text-cream',
    text: 'text-cream/85',
    button: 'border border-cream/50 bg-cream text-terracotta-deep hover:bg-cream-paper',
  },
  soft: {
    box: 'bg-blush/50',
    heading: 'text-teal',
    text: 'text-ink-soft',
    button: 'bg-terracotta text-cream hover:bg-terracotta-80',
  },
  paper: {
    box: 'border border-teal/10 bg-cream-paper',
    heading: 'text-teal',
    text: 'text-ink-soft',
    button: 'bg-terracotta text-cream hover:bg-terracotta-80',
  },
};

export function CtaBlock({ s, headingAs }: { s: Base & Record<string, unknown>; headingAs: HeadingTag }) {
  const panels = (s.panels as Panel[]) ?? [];
  const H = headingAs;
  return (
    <SectionShell s={s}>
      <div className="container-dama">
        <div className={cn('grid gap-6', panels.length > 1 && 'md:grid-cols-2', panels.length > 2 && 'lg:grid-cols-3')}>
          {panels.map((p, i) => {
            const look = PANEL[p.tone ?? 'primary'] ?? PANEL.primary;
            const href = resolveLink(p.link);
            return (
              <div key={p._key ?? i} className={cn('rounded-lg p-9', look.box)}>
                <H className={cn('font-display text-display-md', look.heading)}>{p.heading}</H>
                {p.text && <p className={cn('mt-3 max-w-sm', look.text)}>{p.text}</p>}
                {href && p.buttonLabel && (
                  <div className="mt-7">
                    <SmartLink
                      href={href}
                      className={cn(
                        'inline-flex min-h-[44px] items-center justify-center rounded-btn px-5 py-2.5 font-medium transition-colors duration-300',
                        look.button,
                      )}
                    >
                      {p.buttonLabel}
                    </SmartLink>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

// ── FAQ ───────────────────────────────────────────────────────
type Qa = { q?: string; a?: string };

export function FaqBlock({ s, headingAs }: { s: Base & Record<string, unknown>; headingAs: HeadingTag }) {
  const bg = bgOf(s.background);
  const t = toneOf(bg);
  const items = ((s.items as Qa[]) ?? []).filter((x): x is { q: string; a: string } => Boolean(x.q && x.a));
  if (!items.length) return null;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((x) => ({
      '@type': 'Question',
      name: x.q,
      acceptedAnswer: { '@type': 'Answer', text: x.a },
    })),
  };
  return (
    <SectionShell s={s}>
      <script
        type="application/ld+json"
        // Escape "<" so editor text can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="container-dama">
        <SectionHeader eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} as={headingAs} t={t} />
        <div className={cn('max-w-prose', t.dark && 'rounded-lg bg-cream-paper px-6')}>
          <FAQAccordion items={items} idPrefix={`faq-${s._key ?? 'x'}`} />
        </div>
      </div>
    </SectionShell>
  );
}

// ── Gallery ───────────────────────────────────────────────────
export function GalleryBlock({ s, headingAs }: { s: Base & Record<string, unknown>; headingAs: HeadingTag }) {
  const bg = bgOf(s.background);
  const t = toneOf(bg);
  const images = ((s.images as Img[]) ?? []).filter((im) => im?.url);
  return (
    <SectionShell s={s}>
      <div className="container-dama">
        <SectionHeader eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} as={headingAs} t={t} />
        <div className={cn('grid gap-6', cols(s.columns))}>
          {images.map((im, i) => (
            <Reveal key={im?._key ?? i} delay={(i % 3) * 0.06}>
              <figure>
                <ImageWithScrim
                  category="lifestyle"
                  ratio={ratioOf(s.imageRatio, 'square')}
                  src={im?.url}
                  alt={im?.alt || im?.caption || 'Foto DAMA KITCHEN'}
                />
                {im?.caption && <figcaption className={cn('mt-2 text-caption', t.muted)}>{im.caption}</figcaption>}
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

// ── Inquiry form ──────────────────────────────────────────────
export function FormBlock({ s, headingAs }: { s: Base & Record<string, unknown>; headingAs: HeadingTag }) {
  const bg = bgOf(s.background);
  const t = toneOf(bg);
  const variant = s.variant === 'gifting' ? 'gifting' : 'catering';
  const asideChannels = ((s.asideChannels as string[]) ?? []) as ChannelId[];
  const hasAside = Boolean(s.asideHeading || s.asideText || asideChannels.length);
  return (
    <SectionShell s={s}>
      <div className="container-dama">
        <SectionHeader eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} as={headingAs} t={t} />
        <div className={cn(hasAside && 'grid gap-10 lg:grid-cols-[1.4fr_1fr]')}>
          <div className={cn('max-w-2xl', t.dark && 'rounded-lg bg-cream p-6')}>
            <InquiryForm variant={variant} />
          </div>
          {hasAside && (
            <aside className="h-fit rounded-lg border border-teal/10 bg-cream-paper p-7">
              {Boolean(s.asideHeading) && (
                <h3 className="font-display text-heading text-teal">{s.asideHeading as string}</h3>
              )}
              {Boolean(s.asideText) && <p className="mt-2 text-caption text-ink-soft">{s.asideText as string}</p>}
              {asideChannels.length > 0 && (
                <div className="mt-5 flex flex-col gap-3">
                  {asideChannels.map((c) => (
                    <ChannelButton key={c} channel={c} fullWidth />
                  ))}
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </SectionShell>
  );
}

// ── Divider ───────────────────────────────────────────────────
export function DividerBlock({ s }: { s: Record<string, unknown> }) {
  if (s.style === 'space') return <div aria-hidden="true" className="h-16" />;
  return (
    <div className="container-dama">
      <DiamondDivider />
    </div>
  );
}

// ── Contact ───────────────────────────────────────────────────
export function ContactBlock({ s, headingAs }: { s: Base & Record<string, unknown>; headingAs: HeadingTag }) {
  const bg = bgOf(s.background);
  const t = toneOf(bg);
  return (
    <SectionShell s={s}>
      <div className="container-dama">
        <SectionHeader eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} as={headingAs} t={t} />
        <div className={cn(t.dark && 'rounded-lg bg-cream p-6 sm:p-8')}>
          <ContactDetails showChannels={s.showChannels !== false} />
        </div>
      </div>
    </SectionShell>
  );
}

// ── Custom block ──────────────────────────────────────────────
const WIDTHS: Record<string, string> = { narrow: 'max-w-2xl', normal: 'max-w-4xl', full: 'max-w-none' };

export function CustomBlock({ s, headingAs }: { s: Base & Record<string, unknown>; headingAs: HeadingTag }) {
  const bg = bgOf(s.background);
  const t = toneOf(bg);
  const image = s.image as Img;
  const center = s.align === 'center';
  const boxed = s.boxed !== false;
  return (
    <SectionShell s={s}>
      <div className="container-dama">
        <div
          className={cn(
            'mx-auto',
            WIDTHS[(s.width as string) ?? 'normal'] ?? WIDTHS.normal,
            boxed && cn('rounded-lg border p-7 sm:p-10', t.card),
            center && 'text-center',
          )}
        >
          <SectionHeader eyebrow={s.eyebrow} heading={s.heading} as={headingAs} t={t} align={center ? 'center' : 'left'} />
          {image?.url && (
            <ImageWithScrim category="lifestyle" ratio="wide" src={image.url} alt={image.alt || s.heading || 'Foto DAMA KITCHEN'} className="mb-8" />
          )}
          <RichText html={s.body} tone={t.tone} align={center ? 'center' : 'left'} />
          <BuilderButtons buttons={s.buttons as ButtonValue[]} bg={bg} className={cn('mt-6', center && 'justify-center')} />
        </div>
      </div>
    </SectionShell>
  );
}
