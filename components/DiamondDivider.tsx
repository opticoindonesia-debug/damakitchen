import { cn } from '@/lib/utils';

/**
 * Signature section separator (§4.2): a hairline with a small centered diamond.
 * Used between major narrative sections instead of heavy rules.
 * Never an accent underline beneath a heading — use whitespace there.
 */
export function DiamondDivider({
  tone = 'teal',
  className,
}: {
  tone?: 'teal' | 'terracotta';
  className?: string;
}) {
  const color = tone === 'terracotta' ? 'text-terracotta' : 'text-teal';
  return (
    <div
      className={cn('flex items-center justify-center gap-4 py-8', color, className)}
      role="presentation"
      aria-hidden="true"
    >
      <span className="h-px w-16 bg-current opacity-30 sm:w-24" />
      <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0">
        <rect
          x="6"
          y="0"
          width="8.5"
          height="8.5"
          transform="rotate(45 6 0)"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
      <span className="h-px w-16 bg-current opacity-30 sm:w-24" />
    </div>
  );
}
