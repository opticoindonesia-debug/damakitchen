'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_SITE, type ChannelKey, type ChannelSetting } from '@/lib/settings';

/**
 * Site-wide config needed by client components (WhatsApp number, marketplace
 * links). Provided once by the site layout from the published Site Settings.
 */
export interface SiteConfigValue {
  whatsappNumber: string;
  whatsappMessage: string;
  channels: Record<ChannelKey, ChannelSetting>;
}

const Ctx = createContext<SiteConfigValue>({
  whatsappNumber: DEFAULT_SITE.whatsappNumber,
  whatsappMessage: DEFAULT_SITE.whatsappMessage,
  channels: DEFAULT_SITE.channels,
});

export function SiteConfigProvider({ value, children }: { value: SiteConfigValue; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSiteConfig = () => useContext(Ctx);

/** Resolved destination for a channel (WhatsApp uses the configured number). */
export function channelHref(cfg: SiteConfigValue, id: ChannelKey): string {
  if (id === 'whatsapp') {
    return `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(cfg.whatsappMessage)}`;
  }
  return cfg.channels[id]?.url ?? '';
}

export function channelEnabled(cfg: SiteConfigValue, id: ChannelKey): boolean {
  const c = cfg.channels[id];
  if (!c || c.enabled === false) return false;
  return id === 'whatsapp' ? Boolean(cfg.whatsappNumber) : Boolean(c.url);
}
