/**
 * Editable brand theme.
 *
 * Every palette color is a CSS variable holding an "r g b" triple, consumed by
 * Tailwind as `rgb(var(--c-<token>) / <alpha>)`. Defaults equal the original
 * brand palette exactly, so nothing changes until a color is edited in Studio.
 *
 * Editors change seven BASE colors; all tints/shades of a family are derived
 * from its base, keeping the site coherent whatever colors are chosen.
 */

export type ThemeBase =
  | 'primary' // teal — headings, structure, dark surfaces
  | 'accent' // terracotta — buttons, highlights
  | 'highlight' // gold — small accents
  | 'background' // cream — page canvas
  | 'text' // ink — body text
  | 'soft' // blush — gentle surfaces (gifting)
  | 'festive'; // songket red — celebrations only

export const THEME_DEFAULTS: Record<ThemeBase, string> = {
  primary: '#1F4D4D',
  accent: '#C65B3E',
  highlight: '#C39A3C',
  background: '#F7F1E3',
  text: '#33231C',
  soft: '#E8C7C2',
  festive: '#C0392B',
};

/** Exact original shades, used whenever the family's base is not overridden. */
const ORIGINAL_SHADES: Record<string, string> = {
  'teal-20': '#D2DEDB',
  'teal-40': '#A6BDB8',
  'teal-60': '#5E837D',
  'teal-80': '#356159',
  'teal-100': '#1F4D4D',
  'terracotta-20': '#F0D7CE',
  'terracotta-40': '#E2B0A1',
  'terracotta-60': '#D4866F',
  'terracotta-80': '#CB6B50',
  'terracotta-100': '#C65B3E',
  'terracotta-deep': '#A8472C',
  'gold-20': '#EFE2C2',
  'gold-40': '#E0CA93',
  'gold-60': '#D2B264',
  'gold-80': '#CAA34B',
  'gold-100': '#C39A3C',
  cream: '#F7F1E3',
  'cream-deep': '#EFE6D2',
  'cream-paper': '#FBF7EE',
  ink: '#33231C',
  'ink-soft': '#5A463C',
  blush: '#E8C7C2',
  'blush-deep': '#D9A6A0',
  festive: '#C0392B',
};

type RGB = [number, number, number];

export function parseHex(hex: string | undefined | null): RGB | null {
  if (!hex) return null;
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
}

const mix = (a: RGB, b: RGB, t: number): RGB =>
  a.map((v, i) => Math.round(v + (b[i] - v) * t)) as RGB;
const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];
const triple = (c: RGB) => c.join(' ');

/** Shades a family derives from its base when the base is edited. */
function deriveFamily(base: ThemeBase, c: RGB): Record<string, RGB> {
  switch (base) {
    case 'primary':
      return {
        'teal-20': mix(c, WHITE, 0.82),
        'teal-40': mix(c, WHITE, 0.62),
        'teal-60': mix(c, WHITE, 0.3),
        'teal-80': mix(c, WHITE, 0.1),
        'teal-100': c,
      };
    case 'accent':
      return {
        'terracotta-20': mix(c, WHITE, 0.78),
        'terracotta-40': mix(c, WHITE, 0.56),
        'terracotta-60': mix(c, WHITE, 0.3),
        'terracotta-80': mix(c, WHITE, 0.1),
        'terracotta-100': c,
        'terracotta-deep': mix(c, BLACK, 0.16),
      };
    case 'highlight':
      return {
        'gold-20': mix(c, WHITE, 0.72),
        'gold-40': mix(c, WHITE, 0.48),
        'gold-60': mix(c, WHITE, 0.24),
        'gold-80': mix(c, WHITE, 0.08),
        'gold-100': c,
      };
    case 'background':
      return {
        cream: c,
        'cream-deep': mix(c, BLACK, 0.04),
        'cream-paper': mix(c, WHITE, 0.45),
      };
    case 'text':
      return { ink: c, 'ink-soft': mix(c, WHITE, 0.19) };
    case 'soft':
      return { blush: c, 'blush-deep': mix(c, BLACK, 0.1) };
    case 'festive':
      return { festive: c };
  }
}

/** CSS declarations for every token at its original default. */
export function defaultThemeCss(): string {
  const decls = Object.entries(ORIGINAL_SHADES).map(
    ([token, hex]) => `--c-${token}:${triple(parseHex(hex)!)};`,
  );
  decls.push(`--accent:${triple(parseHex(ORIGINAL_SHADES['terracotta-100'])!)};`);
  return `:root{${decls.join('')}}`;
}

/**
 * CSS overriding only the families whose base color was edited.
 * Returns '' when nothing is overridden (defaults come from globals.css).
 */
export function themeOverrideCss(overrides: Partial<Record<ThemeBase, string | undefined>>): string {
  const decls: string[] = [];
  (Object.keys(THEME_DEFAULTS) as ThemeBase[]).forEach((base) => {
    const c = parseHex(overrides[base]);
    if (!c || overrides[base]?.toLowerCase() === THEME_DEFAULTS[base].toLowerCase()) return;
    for (const [token, rgb] of Object.entries(deriveFamily(base, c))) {
      decls.push(`--c-${token}:${triple(rgb)};`);
    }
    if (base === 'accent') decls.push(`--accent:${triple(c)};`);
  });
  return decls.length ? `:root{${decls.join('')}}` : '';
}

// ── Readability (WCAG contrast) — used by Studio warnings ─────
function luminance([r, g, b]: RGB) {
  const ch = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function contrastRatio(a: string, b: string): number | null {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return null;
  const [l1, l2] = [luminance(ca), luminance(cb)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Readable text color (cream or ink) for any background hex. */
export function readableOn(bgHex: string): 'light' | 'dark' {
  const c = parseHex(bgHex);
  if (!c) return 'dark';
  return luminance(c) < 0.35 ? 'light' : 'dark';
}
