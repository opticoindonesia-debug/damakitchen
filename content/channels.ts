/**
 * Single source of truth for all commerce/contact channels (§9).
 *
 * No checkout lives on this site — we route to existing live channels.
 * All numbers/URLs are env-driven with clearly marked placeholders.
 * TODO: replace placeholders with real WhatsApp number, store URLs and handles.
 */

export type ChannelId = 'shopee' | 'tiktok' | 'whatsapp' | 'gofood' | 'grab';

export interface ChannelConfig {
  id: ChannelId;
  /** Brand-correct, gentle label (§5.4 microcopy). */
  label: string;
  /** Destination URL. WhatsApp is built dynamically via lib/whatsapp. */
  href: string;
}

/**
 * WhatsApp business number in E.164 WITHOUT the leading "+" (wa.me format).
 * Real DAMA business number; overridable via env per environment.
 */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '6281181207201';

export const channels: Record<ChannelId, ChannelConfig> = {
  shopee: {
    id: 'shopee',
    label: 'Lihat di Shopee',
    // TODO: replace with real Shopee store URL.
    href: process.env.NEXT_PUBLIC_SHOPEE_URL ?? 'https://shopee.co.id/',
  },
  tiktok: {
    id: 'tiktok',
    label: 'Lihat di TikTok Shop',
    // TODO: replace with real TikTok Shop URL.
    href: process.env.NEXT_PUBLIC_TIKTOK_URL ?? 'https://www.tiktok.com/',
  },
  whatsapp: {
    id: 'whatsapp',
    label: 'Pesan lewat WhatsApp',
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
  },
  gofood: {
    id: 'gofood',
    label: 'Pesan via GoFood',
    // TODO: replace with real GoFood merchant URL.
    href: process.env.NEXT_PUBLIC_GOFOOD_URL ?? 'https://gofood.co.id/',
  },
  grab: {
    id: 'grab',
    label: 'Pesan via GrabFood',
    // TODO: replace with real GrabFood merchant URL.
    href: process.env.NEXT_PUBLIC_GRAB_URL ?? 'https://food.grab.com/id/id/',
  },
};

/** Social + direct contact handles. TODO: replace with real handles. */
export const contact = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'halo@damakitchen.id', // TODO
  instagram: {
    handle: '@damakitchen', // TODO
    href: 'https://instagram.com/damakitchen', // TODO
  },
  tiktok: {
    handle: '@damakitchen', // TODO
    href: 'https://www.tiktok.com/@damakitchen', // TODO
  },
  threads: {
    handle: '@damakitchen', // TODO
    href: 'https://www.threads.net/@damakitchen', // TODO
  },
  /** Service coverage note. TODO: confirm real coverage area. */
  coverage: 'Melayani area Jabodetabek. Pengiriman frozen ke seluruh Indonesia.',
};
