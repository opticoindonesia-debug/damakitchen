import Link from 'next/link';
import type { ReactNode } from 'react';
import { DiamondDivider } from '@/components/DiamondDivider';
import { PatternBand } from '@/components/PatternBand';
import { cn } from '@/lib/utils';

/**
 * Shared building blocks for page-builder sections: background → tone mapping,
 * the section wrapper, headers and buttons. Every color is a theme token, so
 * sections follow whatever palette is set in Studio → Warna.
 */

export type Bg = 'cream' | 'paper' | 'deep' | 'soft' | 'highlight' | 'primary' | 'accent';
export type HeadingTag = 'h1' | 'h2';

const BG: Record<Bg, { cls: string; dark: boolean }> = {
  cream: { cls: 'bg-cream', dark: false },
  paper: { cls: 'bg-cream-paper', dark: false },
  deep: { cls: 'bg-cream-deep', dark: false },
  soft: { cls: 'bg-blush/40', dark: false },
  highlight: { cls: 'bg-gold-20', dark: false },
  primary: { cls: 'bg-teal', dark: true },
  accent: { cls: 'bg-terracotta-deep', dark: true },
};

export const bgOf = (v: unknown): Bg => (typeof v === 'string' && v in BG ? (v as Bg) : 'cream');

/** Text classes that stay readable on a given background. */
export function toneOf(bg: Bg) {
  const dark = BG[bg].dark;
  return {
    dark,
    tone: (dark ? 'dark' : 'light') as 'light' | 'dark',
    heading: dark ? 'text-cream' : 'text-teal',
    body: bg === 'accent' ? 'text-cream' : dark ? 'text-cream/90' : 'text-ink',
    muted: bg === 'accent' ? 'text-cream' : dark ? 'text-cream/80' : 'text-ink-soft',
    eyebrow: bg === 'primary' ? 'text-gold' : dark ? 'text-cream/90' : 'text-terracotta-deep',
    accentText: bg === 'primary' ? 'text-gold' : dark ? 'text-cream' : 'text-terracotta',
    link: dark ? 'text-cream' : 'text-terracotta-deep',
    card: dark ? 'border-cream/20 bg-cream/10' : 'border-teal/10 bg-cream-paper shadow-soft',
    cardHeading: dark ? 'text-cream' : 'text-teal',
    cardText: dark ? 'text-cream/80' : 'text-ink-soft',
    featureTitle: bg === 'primary' ? 'text-gold' : dark ? 'text-cream' : 'text-teal',
  };
}
export type Tone = ReturnType<typeof toneOf>;

const SPACING: Record<string, string> = {
  compact: 'py-12',
  normal: 'py-section',
  spacious: 'py-[clamp(5rem,12vw,10rem)]',
};

type ImageValue = { url?: string; alt?: string } | undefined;

export interface SectionStyle {
  _key?: string;
  background?: string;
  spacing?: string;
  motif?: string;
  motifImage?: ImageValue;
  motifOpacity?: number;
  dividerAbove?: boolean;
  anchor?: string;
  device?: string;
}

/** Section wrapper: background, spacing, optional motif wash and divider. */
export function SectionShell({ s, children }: { s: SectionStyle; children: ReactNode }) {
  const bg = bgOf(s.background);
  const motif = s.motif && s.motif !== 'none' ? s.motif : undefined;
  const motifSrc = s.motifImage?.url;
  const opacity = typeof s.motifOpacity === 'number' ? Math.min(Math.max(s.motifOpacity, 0), 12) / 100 : 0.05;
  return (
    <section
      id={s.anchor || undefined}
      className={cn(
        'relative overflow-hidden',
        BG[bg].cls,
        SPACING[s.spacing ?? 'normal'] ?? SPACING.normal,
        s.device === 'desktop' && 'hidden md:block',
        s.device === 'mobile' && 'md:hidden',
      )}
    >
      {(motif || motifSrc) && (
        <PatternBand motif={(motif ?? 'none') as never} src={motifSrc} opacity={opacity} />
      )}
      {s.dividerAbove && <DiamondDivider tone={BG[bg].dark ? 'terracotta' : 'teal'} className="relative !pt-0" />}
      <div className="relative">{children}</div>
    </section>
  );
}

/** Eyebrow + heading + intro, matching the coded Section header. */
export function SectionHeader({
  eyebrow,
  heading,
  intro,
  as = 'h2',
  t,
  align = 'left',
}: {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  as?: HeadingTag;
  t: Tone;
  align?: 'left' | 'center';
}) {
  if (!eyebrow && !heading && !intro) return null;
  const H = as;
  const center = align === 'center';
  return (
    <header className={cn('mb-10 max-w-prose sm:mb-14', center && 'mx-auto text-center')}>
      {eyebrow && (
        <p
          className={cn(
            'mb-3 font-sans text-label font-semibold uppercase tracking-[0.18em]',
            t.eyebrow,
            center && 'text-center',
          )}
        >
          {eyebrow}
        </p>
      )}
      {heading && <H className={cn('text-display-md', t.heading)}>{heading}</H>}
      {intro && <p className={cn('mt-4 text-body-lg', t.muted, center && 'text-center')}>{intro}</p>}
    </header>
  );
}

/** "whatsapp" → the configured WhatsApp chat (via /go/whatsapp); everything else as typed. */
export function resolveLink(link?: string): string | undefined {
  if (!link) return undefined;
  return link.trim() === 'whatsapp' ? '/go/whatsapp' : link.trim();
}

const BTN_BASE =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-btn px-7 py-3.5 font-sans text-body-lg font-medium transition-colors duration-300 ease-calm focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2';

export function buttonClasses(style: string | undefined, bg: Bg) {
  if (style === 'secondary') {
    return cn(
      BTN_BASE,
      BG[bg].dark
        ? 'border border-cream/50 text-cream hover:bg-cream/10'
        : 'border border-teal/40 text-teal hover:bg-teal/5',
    );
  }
  return cn(
    BTN_BASE,
    bg === 'accent'
      ? 'bg-cream text-terracotta-deep hover:bg-cream-paper'
      : 'bg-terracotta-deep text-cream hover:bg-terracotta-deep/90',
  );
}

export function SmartLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  if (/^(https?:|mailto:|tel:)/.test(href) || href.startsWith('/go/')) {
    const external = href.startsWith('http') || href.startsWith('/go/');
    return (
      <a href={href} className={className} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export interface ButtonValue {
  _key?: string;
  label?: string;
  link?: string;
  style?: string;
}

export function BuilderButtons({
  buttons,
  bg,
  className,
}: {
  buttons?: ButtonValue[];
  bg: Bg;
  className?: string;
}) {
  const list = (buttons ?? []).filter((b) => b.label && resolveLink(b.link));
  if (!list.length) return null;
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {list.map((b, i) => (
        <SmartLink key={b._key ?? i} href={resolveLink(b.link)!} className={buttonClasses(b.style, bg)}>
          {b.label}
        </SmartLink>
      ))}
    </div>
  );
}

/** Splits plain text into paragraphs on blank lines. */
export const paragraphs = (text?: string) =>
  (text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
