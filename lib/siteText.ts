import { site } from '@/content/site';

/**
 * Defaults for every editable piece of site chrome text (navigation, footer,
 * sub-brand page labels). Studio values override these field-by-field.
 * Kept in a plain module so both server and client components can import it.
 */

/** One navbar entry: a plain link, or the grouped sub-brand dropdown. */
export type NavItem =
  | { kind: 'link'; label: string; href: string }
  | { kind: 'subBrands'; label: string };

export const DEFAULT_NAV: NavItem[] = [
  { kind: 'link', label: 'Cerita', href: '/cerita' },
  { kind: 'link', label: 'Menu', href: '/menu' },
  { kind: 'subBrands', label: 'Sub-brand' },
  { kind: 'link', label: 'Katering', href: '/katering' },
  { kind: 'link', label: 'Hadiah', href: '/hadiah' },
];

export const DEFAULT_NAV_CTA = { label: 'Pesan', href: '/pesan' };

export interface FooterText {
  colSubBrand: string;
  colExplore: string;
  colContact: string;
  exploreLinks: { label: string; href: string }[];
  /** Bottom-left line. */
  note: string;
}

export const DEFAULT_FOOTER_TEXT: FooterText = {
  colSubBrand: 'Sub-brand',
  colExplore: 'Jelajahi',
  colContact: 'Sapa kami',
  exploreLinks: [
    { label: 'Cerita', href: '/cerita' },
    { label: 'Menu', href: '/menu' },
    { label: 'Katering', href: '/katering' },
    { label: 'Hadiah', href: '/hadiah' },
    { label: 'Corporate', href: '/corporate' },
    { label: 'Di mana memesan', href: '/pesan' },
    { label: 'Catatan Dapur', href: '/catatan-dapur' },
    { label: 'Tanya jawab', href: '/faq' },
    { label: 'Kontak', href: '/kontak' },
  ],
  note: `Setiap lini disajikan ${site.hashtag} — by DAMA.`,
};

/** Headings on every sub-brand page. `{nama}` is replaced by the line name. */
export interface SubBrandLabels {
  aboutEyebrow: string;
  aboutTitle: string;
  productsEyebrow: string;
  productsTitle: string;
  orderTitle: string;
  faqEyebrow: string;
  faqTitle: string;
  crossSell: string;
}

export const DEFAULT_SUBBRAND_LABELS: SubBrandLabels = {
  aboutEyebrow: 'Tentang lini ini',
  aboutTitle: 'Apa itu {nama}',
  productsEyebrow: 'Pilihan hidangan',
  productsTitle: 'Yang bisa Anda nikmati',
  orderTitle: 'Cara memesan',
  faqEyebrow: 'Hal yang sering ditanya',
  faqTitle: 'Sejujurnya, begini',
  crossSell: 'Mungkin juga cocok…',
};
