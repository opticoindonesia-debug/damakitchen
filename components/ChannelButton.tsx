import type { SVGProps } from 'react';
import { channels, isChannelEnabled, type ChannelId } from '@/content/channels';
import { cn } from '@/lib/utils';

/**
 * ChannelButton (§8): routes to a live channel with the brand-correct label.
 * Channel marks are simple, single-color line glyphs to stay calm and on-brand.
 * TODO: swap for official channel logos where licensing allows.
 */

function Glyph({ children, ...p }: SVGProps<SVGSVGElement> & { children: React.ReactNode }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...p}
    >
      {children}
    </svg>
  );
}

const channelGlyph: Record<ChannelId, React.ReactNode> = {
  whatsapp: (
    <Glyph>
      <path d="M4 20l1.5-4A8 8 0 1 1 9 19.2L4 20Z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.6 1-1.2l-1.8-.8-.9.9c-1-.4-1.8-1.2-2.2-2.2l.9-.9-.8-1.8c-.6 0-1.2.4-1.2 1Z" />
    </Glyph>
  ),
  shopee: (
    <Glyph>
      <path d="M5 8h14l-1 11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
      <path d="M10 13c.5.7 1.2 1 2 1s1.8-.6 1.8-1.5S13 11 12 11s-1.6-.4-1.6-1.2" />
    </Glyph>
  ),
  tiktok: (
    <Glyph>
      <path d="M14 4v9.5a3.5 3.5 0 1 1-3-3.46" />
      <path d="M14 7a4 4 0 0 0 4 3.5" />
    </Glyph>
  ),
  gofood: (
    <Glyph>
      <path d="M5 11h14a7 7 0 0 1-14 0Z" />
      <path d="M9 6c0 1-1 1.3-1 2.3M13 6c0 1-1 1.3-1 2.3" />
      <path d="M6 16h12" />
    </Glyph>
  ),
  grab: (
    <Glyph>
      <circle cx={12} cy={12} r={8} />
      <path d="M8 14c0-2 1.5-3.5 3.5-3.5S15 11 15 9.5" />
      <path d="M15 14v.01" />
    </Glyph>
  ),
};

export function ChannelButton({
  channel,
  href,
  className,
  fullWidth = false,
}: {
  channel: ChannelId;
  /** Override the destination (e.g. a context-specific WhatsApp deep link). */
  href?: string;
  className?: string;
  fullWidth?: boolean;
}) {
  // Kanal yang dinonaktifkan tidak ditampilkan di mana pun.
  if (!isChannelEnabled(channel)) return null;
  const cfg = channels[channel];
  return (
    <a
      href={href ?? cfg.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex min-h-[44px] items-center justify-center gap-2.5 rounded border border-teal/20 bg-cream-paper px-5 py-2.5 text-body font-medium text-teal transition-colors duration-300 ease-calm hover:bg-teal/5 focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        fullWidth && 'w-full',
        className,
      )}
    >
      <span className="text-terracotta">{channelGlyph[channel]}</span>
      {cfg.label}
    </a>
  );
}
