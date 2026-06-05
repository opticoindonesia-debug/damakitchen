/**
 * Site-wide constants: brand metadata and navigation (§6).
 */

export const site = {
  name: 'DAMA KITCHEN',
  tagline: 'Taraso Disayang',
  hashtag: '#TarasoDisayang',
  brandLineEn: 'Authentic Flavours. Made with Purpose.',
  umbrellaPromise: 'Masakan Minang otentik yang membuat taraso disayang.',
  rootProverb: 'Dari Mato Turun Ka Paruik.',
  // TODO: confirm production domain.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://damakitchen.id',
  themeColor: '#1F4D4D',
} as const;

/**
 * Seasonal celebration slot (§7.6). When active, gifting pages surface a
 * festive note using the songket-red accent (perayaan only).
 * TODO: toggle `active` and update copy around Lebaran/Natal.
 */
export const seasonal = {
  active: false,
  label: 'Edisi Perayaan',
  message: 'Hampers edisi Lebaran sedang kami siapkan. Pesan lebih awal agar tak kehabisan.',
} as const;

export interface NavLink {
  href: string;
  label: string;
  /** Primary CTA gets terracotta treatment in the nav (§6). */
  primary?: boolean;
}

export const navLinks: NavLink[] = [
  { href: '/cerita', label: 'Cerita' },
  { href: '/menu', label: 'Menu' },
  { href: '/katering', label: 'Katering' },
  { href: '/hadiah', label: 'Hadiah' },
  { href: '/pesan', label: 'Pesan', primary: true },
];
