/**
 * Shapes, defaults and validators for the three settings singletons:
 * site (identity, contact, channels, SEO defaults), theme (design tokens) and
 * navigation (header + footer). Shared by the admin (client) and the server.
 */
import { site as siteContent, seasonal as seasonalContent } from '@/content/site';
import { contact, WHATSAPP_NUMBER, channels as channelContent } from '@/content/channels';
import { founder } from '@/content/story';
import { THEME_DEFAULTS, parseHex, type ThemeBase } from '@/lib/theme';
import {
  DEFAULT_FOOTER_TEXT,
  DEFAULT_NAV,
  DEFAULT_NAV_CTA,
  DEFAULT_SUBBRAND_LABELS,
  type NavItem,
  type SubBrandLabels,
} from '@/lib/siteText';
import { cleanImage, cleanText, isSafeLink, type ImageValue } from '@/lib/text';

// ── Site settings ─────────────────────────────────────────────
export type ChannelKey = 'shopee' | 'tiktok' | 'whatsapp' | 'gofood' | 'grab';

export interface ChannelSetting {
  label: string;
  url: string;
  enabled: boolean;
}

export interface SiteSettingsData {
  siteName: string;
  tagline: string;
  hashtag: string;
  brandLineEn: string;
  description: string;
  logo?: ImageValue;
  logoLight?: ImageValue;
  monogram?: ImageValue;
  favicon?: ImageValue;
  ogImage?: ImageValue;
  email: string;
  phone: string;
  whatsappNumber: string;
  whatsappMessage: string;
  instagram: string;
  tiktok: string;
  threads: string;
  facebook: string;
  youtube: string;
  channels: Record<ChannelKey, ChannelSetting>;
  address: string;
  serviceArea: string;
  operatingHours: string;
  seoTitle: string;
  seoDescription: string;
  seasonal: { active: boolean; label: string; message: string };
  subBrandLabels: SubBrandLabels;
  // Fallback home-page content (used only if the Beranda page is empty).
  heroHeadline: string;
  essence: string;
  founderQuote: string;
  founderName: string;
  founderRole: string;
  backgroundMotif: string;
  motifOpacity: number;
}

export const DEFAULT_SITE: SiteSettingsData = {
  siteName: siteContent.name,
  tagline: siteContent.tagline,
  hashtag: siteContent.hashtag,
  brandLineEn: siteContent.brandLineEn,
  description: siteContent.umbrellaPromise,
  email: contact.email,
  phone: '',
  whatsappNumber: WHATSAPP_NUMBER,
  whatsappMessage: 'Halo DAMA 🙂 saya ingin bertanya. Boleh dibantu?',
  instagram: contact.instagram.href,
  tiktok: contact.tiktok.href,
  threads: contact.threads.href,
  facebook: '',
  youtube: '',
  channels: {
    shopee: { label: channelContent.shopee.label, url: channelContent.shopee.href, enabled: channelContent.shopee.enabled !== false },
    tiktok: { label: channelContent.tiktok.label, url: channelContent.tiktok.href, enabled: channelContent.tiktok.enabled !== false },
    whatsapp: { label: channelContent.whatsapp.label, url: '', enabled: true },
    gofood: { label: channelContent.gofood.label, url: channelContent.gofood.href, enabled: channelContent.gofood.enabled !== false },
    grab: { label: channelContent.grab.label, url: channelContent.grab.href, enabled: channelContent.grab.enabled !== false },
  },
  address: '',
  serviceArea: contact.coverage,
  operatingHours: '',
  seoTitle: `${siteContent.name} — ${siteContent.tagline}`,
  seoDescription: siteContent.umbrellaPromise,
  seasonal: { active: seasonalContent.active, label: seasonalContent.label, message: seasonalContent.message },
  subBrandLabels: DEFAULT_SUBBRAND_LABELS,
  heroHeadline: `${siteContent.tagline}.`,
  essence: 'Masakan bukan sekadar makanan — ia sarana merawat hubungan.',
  founderQuote: founder.pullQuote,
  founderName: founder.name,
  founderRole: founder.role,
  backgroundMotif: 'songket-geometric',
  motifOpacity: 5,
};

const url = (v: unknown, fb = ''): string => {
  if (typeof v !== 'string' || !v.trim()) return fb;
  try {
    const u = new URL(v.trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : fb;
  } catch {
    return fb;
  }
};
const txt = (v: unknown, fb: string, max = 300) => {
  const s = cleanText(v, max).trim();
  return s || fb;
};
const opt = (v: unknown, max = 300) => cleanText(v, max).trim();

export function cleanSiteSettings(input: unknown): { data: SiteSettingsData; problems: string[] } {
  const d = (input ?? {}) as Record<string, unknown>;
  const problems: string[] = [];
  const wa = String(d.whatsappNumber ?? '').replace(/[^0-9]/g, '');
  if (wa && (wa.length < 8 || wa.length > 16)) problems.push('Nomor WhatsApp tidak valid (gunakan format 62812…).');
  const email = opt(d.email, 190);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push('Alamat email tidak valid.');
  const ch = (d.channels ?? {}) as Record<string, Record<string, unknown>>;
  const channels = Object.fromEntries(
    (Object.keys(DEFAULT_SITE.channels) as ChannelKey[]).map((k) => {
      const c = ch[k] ?? {};
      const u = url(c.url);
      if (c.url && !u) problems.push(`Tautan kanal ${k} tidak valid.`);
      return [k, { label: txt(c.label, DEFAULT_SITE.channels[k].label, 80), url: u, enabled: c.enabled !== false }];
    }),
  ) as Record<ChannelKey, ChannelSetting>;
  const seasonal = (d.seasonal ?? {}) as Record<string, unknown>;
  const labels = (d.subBrandLabels ?? {}) as Record<string, unknown>;
  const data: SiteSettingsData = {
    siteName: txt(d.siteName, DEFAULT_SITE.siteName, 120),
    tagline: txt(d.tagline, DEFAULT_SITE.tagline, 160),
    hashtag: opt(d.hashtag, 80),
    brandLineEn: opt(d.brandLineEn, 200),
    description: txt(d.description, DEFAULT_SITE.description, 400),
    logo: cleanImage(d.logo),
    logoLight: cleanImage(d.logoLight),
    monogram: cleanImage(d.monogram),
    favicon: cleanImage(d.favicon),
    ogImage: cleanImage(d.ogImage),
    email,
    phone: opt(d.phone, 40),
    whatsappNumber: wa || DEFAULT_SITE.whatsappNumber,
    whatsappMessage: txt(d.whatsappMessage, DEFAULT_SITE.whatsappMessage, 400),
    instagram: url(d.instagram),
    tiktok: url(d.tiktok),
    threads: url(d.threads),
    facebook: url(d.facebook),
    youtube: url(d.youtube),
    channels,
    address: opt(d.address, 400),
    serviceArea: opt(d.serviceArea, 400),
    operatingHours: opt(d.operatingHours, 300),
    seoTitle: txt(d.seoTitle, DEFAULT_SITE.seoTitle, 120),
    seoDescription: txt(d.seoDescription, DEFAULT_SITE.seoDescription, 320),
    seasonal: {
      active: seasonal.active === true,
      label: txt(seasonal.label, DEFAULT_SITE.seasonal.label, 80),
      message: txt(seasonal.message, DEFAULT_SITE.seasonal.message, 400),
    },
    subBrandLabels: Object.fromEntries(
      Object.entries(DEFAULT_SUBBRAND_LABELS).map(([k, fb]) => [k, txt(labels[k], fb, 160)]),
    ) as unknown as SubBrandLabels,
    heroHeadline: txt(d.heroHeadline, DEFAULT_SITE.heroHeadline, 200),
    essence: txt(d.essence, DEFAULT_SITE.essence, 400),
    founderQuote: txt(d.founderQuote, DEFAULT_SITE.founderQuote, 600),
    founderName: txt(d.founderName, DEFAULT_SITE.founderName, 120),
    founderRole: txt(d.founderRole, DEFAULT_SITE.founderRole, 120),
    backgroundMotif: ['songket-geometric', 'bunga-floral', 'daun-leaf', 'geometric-gold', 'none'].includes(d.backgroundMotif as string)
      ? (d.backgroundMotif as string)
      : 'songket-geometric',
    motifOpacity: Math.min(Math.max(Number(d.motifOpacity ?? 5) || 0, 0), 12),
  };
  return { data, problems };
}

// ── Theme ─────────────────────────────────────────────────────
export const HEADING_FONTS = [
  { value: 'playfair', label: 'Playfair Display (asli DAMA)' },
  { value: 'lora', label: 'Lora' },
  { value: 'cormorant', label: 'Cormorant Garamond' },
  { value: 'dmserif', label: 'DM Serif Display' },
] as const;
export const BODY_FONTS = [
  { value: 'poppins', label: 'Poppins (asli DAMA)' },
  { value: 'inter', label: 'Inter' },
  { value: 'nunito', label: 'Nunito Sans' },
  { value: 'lato', label: 'Lato' },
] as const;

export interface ThemeData {
  colors: Record<ThemeBase, string>;
  headingFont: string;
  bodyFont: string;
  buttonShape: 'rounded' | 'pill' | 'square';
  radius: 'none' | 'small' | 'medium' | 'large';
  sectionSpacing: 'compact' | 'normal' | 'spacious';
  containerWidth: 'narrow' | 'normal' | 'wide';
  headerStyle: 'light' | 'dark';
  headerSticky: boolean;
  footerStyle: 'dark' | 'light';
}

/** DAMA brand palette (owner-approved initial palette). */
export const BRAND_PALETTE: Record<ThemeBase, string> = {
  primary: '#1F4D4D', // Deep Teal
  accent: '#C65B3E', // Terracotta
  highlight: '#D9A441', // Gold
  background: '#F2E8D9', // Cream
  text: '#4A2F22', // Deep Brown
  soft: '#E6C7C7', // Blush Rose
  festive: THEME_DEFAULTS.festive,
};

export const DEFAULT_THEME: ThemeData = {
  colors: BRAND_PALETTE,
  headingFont: 'playfair',
  bodyFont: 'poppins',
  buttonShape: 'rounded',
  radius: 'medium',
  sectionSpacing: 'normal',
  containerWidth: 'normal',
  headerStyle: 'light',
  headerSticky: true,
  footerStyle: 'dark',
};

const pick = <T extends string>(v: unknown, allowed: readonly T[], fb: T): T =>
  allowed.includes(v as T) ? (v as T) : fb;

export function cleanTheme(input: unknown): ThemeData {
  const d = (input ?? {}) as Record<string, unknown>;
  const c = (d.colors ?? {}) as Record<string, unknown>;
  const colors = Object.fromEntries(
    (Object.keys(BRAND_PALETTE) as ThemeBase[]).map((k) => {
      const v = typeof c[k] === 'string' ? (c[k] as string).trim() : '';
      return [k, parseHex(v) ? (v.startsWith('#') ? v : `#${v}`).toUpperCase() : BRAND_PALETTE[k]];
    }),
  ) as Record<ThemeBase, string>;
  return {
    colors,
    headingFont: pick(d.headingFont, HEADING_FONTS.map((f) => f.value), 'playfair'),
    bodyFont: pick(d.bodyFont, BODY_FONTS.map((f) => f.value), 'poppins'),
    buttonShape: pick(d.buttonShape, ['rounded', 'pill', 'square'] as const, 'rounded'),
    radius: pick(d.radius, ['none', 'small', 'medium', 'large'] as const, 'medium'),
    sectionSpacing: pick(d.sectionSpacing, ['compact', 'normal', 'spacious'] as const, 'normal'),
    containerWidth: pick(d.containerWidth, ['narrow', 'normal', 'wide'] as const, 'normal'),
    headerStyle: pick(d.headerStyle, ['light', 'dark'] as const, 'light'),
    headerSticky: d.headerSticky !== false,
    footerStyle: pick(d.footerStyle, ['dark', 'light'] as const, 'dark'),
  };
}

// ── Navigation ────────────────────────────────────────────────
export type NavEntry =
  | NavItem
  | { kind: 'dropdown'; label: string; children: { label: string; href: string }[] };

export interface NavigationData {
  items: NavEntry[];
  cta: { label: string; href: string; show: boolean };
  footer: {
    colSubBrand: string;
    colExplore: string;
    colContact: string;
    exploreLinks: { label: string; href: string }[];
    note: string;
    showSubBrands: boolean;
    showSocials: boolean;
  };
}

export const DEFAULT_NAVIGATION: NavigationData = {
  items: DEFAULT_NAV,
  cta: { ...DEFAULT_NAV_CTA, show: true },
  footer: { ...DEFAULT_FOOTER_TEXT, showSubBrands: true, showSocials: true },
};

function cleanLinks(raw: unknown, problems: string[], where: string): { label: string; href: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 30).flatMap((l, i) => {
    const o = (l ?? {}) as Record<string, unknown>;
    const label = cleanText(o.label, 80).trim();
    if (!label) return [];
    if (!isSafeLink(o.href)) {
      problems.push(`${where} ${i + 1} ("${label}"): tautan tidak valid`);
      return [];
    }
    return [{ label, href: (o.href as string).trim() }];
  });
}

export function cleanNavigation(input: unknown): { data: NavigationData; problems: string[] } {
  const d = (input ?? {}) as Record<string, unknown>;
  const problems: string[] = [];
  const items: NavEntry[] = (Array.isArray(d.items) ? d.items : []).slice(0, 12).flatMap((it, i): NavEntry[] => {
    const o = (it ?? {}) as Record<string, unknown>;
    const label = cleanText(o.label, 60).trim();
    if (!label) return [];
    if (o.kind === 'subBrands') return [{ kind: 'subBrands', label }];
    if (o.kind === 'dropdown') {
      return [{ kind: 'dropdown', label, children: cleanLinks(o.children, problems, `Menu "${label}" → tautan`) }];
    }
    if (!isSafeLink(o.href)) {
      problems.push(`Menu ${i + 1} ("${label}"): tautan tidak valid`);
      return [];
    }
    return [{ kind: 'link', label, href: (o.href as string).trim() }];
  });
  const cta = (d.cta ?? {}) as Record<string, unknown>;
  const f = (d.footer ?? {}) as Record<string, unknown>;
  const ctaHref = isSafeLink(cta.href) ? (cta.href as string).trim() : DEFAULT_NAV_CTA.href;
  return {
    problems,
    data: {
      items,
      cta: { label: txt(cta.label, DEFAULT_NAV_CTA.label, 40), href: ctaHref, show: cta.show !== false },
      footer: {
        colSubBrand: txt(f.colSubBrand, DEFAULT_FOOTER_TEXT.colSubBrand, 60),
        colExplore: txt(f.colExplore, DEFAULT_FOOTER_TEXT.colExplore, 60),
        colContact: txt(f.colContact, DEFAULT_FOOTER_TEXT.colContact, 60),
        exploreLinks: cleanLinks(f.exploreLinks, problems, 'Tautan footer'),
        note: opt(f.note, 300),
        showSubBrands: f.showSubBrands !== false,
        showSocials: f.showSocials !== false,
      },
    },
  };
}
