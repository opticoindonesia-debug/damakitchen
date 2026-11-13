'use client';

/**
 * Minimal analytics bridge. Sends to gtag (GA4 direct) or the GTM dataLayer —
 * whichever is loaded. Does nothing when no analytics ID is configured.
 * Never put personal data (names, phone numbers, messages) in event params.
 */
type Params = Record<string, string | number | boolean | undefined>;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __damaGtag?: boolean;
  }
}

export function track(event: string, params: Params = {}): void {
  if (typeof window === 'undefined') return;
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));
  if (window.__damaGtag && window.gtag) window.gtag('event', event, clean);
  else if (window.dataLayer) window.dataLayer.push({ event, ...clean });
}

const SRC_KEY = 'dama_src';

/** First-touch campaign attribution (utm_*, referrer host, landing page). Kept per browser, never overwritten. */
export function captureSource(): void {
  try {
    if (localStorage.getItem(SRC_KEY)) return;
    const u = new URL(window.location.href);
    const src: Record<string, string> = {};
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid']) {
      const v = u.searchParams.get(k);
      if (v) src[k] = v.slice(0, 100);
    }
    if (document.referrer) {
      const host = new URL(document.referrer).host;
      if (host && host !== u.host) src.referrer = host;
    }
    src.landing = u.pathname.slice(0, 200);
    localStorage.setItem(SRC_KEY, JSON.stringify(src));
  } catch {
    /* storage unavailable — attribution is optional */
  }
}

export function getSource(): Record<string, string> | null {
  try {
    return JSON.parse(localStorage.getItem(SRC_KEY) ?? 'null');
  } catch {
    return null;
  }
}

const MARKETPLACES: [RegExp, string][] = [
  [/(^|\.)shopee\.co\.id$/, 'shopee'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/(^|\.)gofood\.co\.id$|(^|\.)gojek\.com$/, 'gofood'],
  [/(^|\.)grab\.com$/, 'grab'],
  [/(^|\.)tokopedia\.com$/, 'tokopedia'],
];

/** Classifies a link click into click_whatsapp / click_marketplace (or null). */
export function classifyLink(href: string): { event: string; params: Params } | null {
  try {
    const u = new URL(href, window.location.href);
    if (u.host === 'wa.me' || u.host.endsWith('whatsapp.com') || u.pathname === '/go/whatsapp') {
      return { event: 'click_whatsapp', params: {} };
    }
    const m = MARKETPLACES.find(([re]) => re.test(u.host));
    if (m) return { event: 'click_marketplace', params: { marketplace: m[1] } };
  } catch {
    /* ignore malformed */
  }
  return null;
}
