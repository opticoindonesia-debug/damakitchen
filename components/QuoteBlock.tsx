import { cn } from '@/lib/utils';

/**
 * QuoteBlock (§8): Playfair italic over a thin band. Used for pull-quotes and
 * the founder's truth. Serif is reserved for headings and quotes only (§3.4).
 */
export function QuoteBlock({
  children,
  cite,
  tone = 'teal',
  className,
}: {
  children: React.ReactNode;
  cite?: string;
  tone?: 'teal' | 'cream';
  className?: string;
}) {
  const onCream = tone === 'teal';
  return (
    <figure
      className={cn(
        'border-l-2 pl-6 sm:pl-8',
        onCream ? 'border-terracotta' : 'border-gold',
        className,
      )}
    >
      <blockquote
        className={cn(
          'font-display text-display-md italic',
          onCream ? 'text-teal' : 'text-cream',
        )}
      >
        {children}
      </blockquote>
      {cite && (
        <figcaption
          className={cn(
            'mt-4 text-caption not-italic',
            onCream ? 'text-ink-soft' : 'text-cream/75',
          )}
        >
          — {cite}
        </figcaption>
      )}
    </figure>
  );
}
