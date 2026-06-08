import { cn } from '@/lib/utils';

/**
 * DAMA KITCHEN logo lockup (§4.5).
 * TODO: swap this typeset lockup for the official SVG logo files when supplied.
 *
 * Renders only in teal / cream / gold|terracotta. Over photography, wrap in
 * <ImageWithScrim> so the lockup keeps sufficient contrast.
 */

type LogoColor = 'teal' | 'cream' | 'gold';
type LogoVariant = 'primary' | 'stacked' | 'monogram';

const colorClass: Record<LogoColor, string> = {
  teal: 'text-teal',
  cream: 'text-cream',
  gold: 'text-gold',
};

export function Logo({
  variant = 'primary',
  color = 'teal',
  withTagline = false,
  className,
  imageUrl,
  monogramUrl,
}: {
  variant?: LogoVariant;
  color?: LogoColor;
  withTagline?: boolean;
  className?: string;
  /** Uploaded logo image (used for primary/stacked). Falls back to typeset. */
  imageUrl?: string;
  /** Uploaded monogram image (used for the monogram variant). */
  monogramUrl?: string;
}) {
  const tone = colorClass[color];

  if (variant === 'monogram') {
    if (monogramUrl) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={monogramUrl} alt="DAMA KITCHEN" className={cn('h-7 w-auto', className)} />;
    }
    return (
      <span
        className={cn('inline-flex items-center font-display font-bold leading-none', tone, className)}
        aria-label="DAMA KITCHEN"
      >
        <span className="text-2xl tracking-tight">D</span>
      </span>
    );
  }

  if (imageUrl) {
    const h = variant === 'stacked' ? 'h-12' : 'h-8 sm:h-9';
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt="DAMA KITCHEN" className={cn(h, 'w-auto', className)} />;
  }

  if (variant === 'stacked') {
    return (
      <span className={cn('inline-flex flex-col items-center leading-none', tone, className)}>
        <span className="font-display text-2xl font-bold tracking-[0.12em]">DAMA</span>
        <span className="font-sans text-[0.65rem] font-medium tracking-[0.4em]">KITCHEN</span>
        {withTagline && (
          <span className="mt-1 font-display text-xs italic opacity-80">#TarasoDisayang</span>
        )}
      </span>
    );
  }

  // primary lockup
  return (
    <span className={cn('inline-flex items-baseline gap-2 leading-none', tone, className)}>
      <span className="font-display text-xl font-bold tracking-[0.14em] sm:text-2xl">DAMA</span>
      <span className="font-sans text-[0.6rem] font-medium tracking-[0.38em] sm:text-xs">
        KITCHEN
      </span>
      {withTagline && (
        <span className="font-display text-xs italic opacity-80">#TarasoDisayang</span>
      )}
    </span>
  );
}
