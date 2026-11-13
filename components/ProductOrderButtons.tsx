'use client';

import { ChannelButton } from './ChannelButton';
import { channelEnabled, useSiteConfig } from './SiteConfig';
import { waOrder } from '@/lib/whatsapp';
import type { ChannelId } from '@/content/channels';

/** Order CTAs on a product page: product-specific links first, then the line's channels. */
export function ProductOrderButtons({
  productName,
  channels,
  links,
}: {
  productName: string;
  channels: ChannelId[];
  links: { label: string; url: string }[];
}) {
  const cfg = useSiteConfig();
  const active = channels.filter((c) => channelEnabled(cfg, c));
  const list: ChannelId[] = active.length ? active : ['whatsapp'];
  return (
    <div className="flex flex-col gap-3 sm:max-w-sm">
      {links.map((l) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center justify-center rounded-btn bg-terracotta px-5 py-2.5 font-medium text-cream hover:bg-terracotta-80"
        >
          {l.label}
        </a>
      ))}
      {list.map((c) => (
        <ChannelButton key={c} channel={c} fullWidth href={c === 'whatsapp' ? waOrder(productName, cfg.whatsappNumber) : undefined} />
      ))}
    </div>
  );
}
