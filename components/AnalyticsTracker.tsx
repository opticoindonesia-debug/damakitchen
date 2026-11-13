'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { captureSource, classifyLink, track } from '@/lib/analytics';

/**
 * - page_view on every client-side navigation (GA4 auto page_view is off to avoid duplicates)
 * - click_whatsapp / click_marketplace / select_item via one delegated listener
 *   (links may add data-track-item / data-track-list for context)
 * - captures first-touch UTM attribution
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    captureSource();
  }, []);

  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    track('page_view', { page_path: pathname, page_location: window.location.href, page_title: document.title });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a) return;
      const href = a.getAttribute('href') ?? '';
      const ctx = { item_name: a.dataset.trackItem, item_list_name: a.dataset.trackList, link_text: (a.textContent ?? '').trim().slice(0, 60), page_path: window.location.pathname };
      const c = classifyLink(href);
      if (c) track(c.event, { ...c.params, ...ctx });
      else if (a.dataset.trackSelect) track('select_item', { item_name: a.dataset.trackItem, item_list_name: a.dataset.trackList });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}

/** Fires one event when mounted (e.g. view_item on a product page). */
export function TrackOnView({ event, params }: { event: string; params?: Record<string, string | number | undefined> }) {
  useEffect(() => {
    track(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
