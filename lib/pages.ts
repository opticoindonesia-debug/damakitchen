/**
 * Built-in site pages that can be fully rebuilt from Studio.
 *
 * Each has a fixed Sanity document ID (`page-<key>` — never use '.' in IDs).
 * If that document exists and has sections, the route renders those sections;
 * otherwise it renders the original coded layout. Deleting the document in
 * Studio therefore "resets" the page to its default design.
 */
export const BUILT_IN_PAGES = {
  beranda: { path: '/', title: 'Beranda' },
  cerita: { path: '/cerita', title: 'Cerita' },
  menu: { path: '/menu', title: 'Menu' },
  katering: { path: '/katering', title: 'Katering & Acara' },
  hadiah: { path: '/hadiah', title: 'Hadiah' },
  pesan: { path: '/pesan', title: 'Di mana memesan' },
  kontak: { path: '/kontak', title: 'Kontak' },
} as const;

export type BuiltInPageKey = keyof typeof BUILT_IN_PAGES;

export const builtInPageId = (key: BuiltInPageKey) => `page-${key}`;

export const BUILT_IN_PAGE_IDS = (Object.keys(BUILT_IN_PAGES) as BuiltInPageKey[]).map(builtInPageId);

/** True for a built-in page document ID (published or draft). */
export function isBuiltInPageId(id: string | undefined): boolean {
  if (!id) return false;
  return BUILT_IN_PAGE_IDS.includes(id.replace(/^drafts\./, ''));
}

/**
 * Slugs custom pages may not use: every first-level route the site already
 * owns (so a custom page can never shadow or duplicate one).
 */
export const RESERVED_SLUGS = [
  ...Object.keys(BUILT_IN_PAGES),
  'lamak-dama',
  'warisan-dama',
  'hidang-basamo',
  'dama-kapau',
  'tando-mato',
  'catatan-dapur',
  'studio',
  'api',
];
