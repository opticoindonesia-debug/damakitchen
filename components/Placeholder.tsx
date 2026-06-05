import { cn } from '@/lib/utils';

/**
 * Warm, correctly-proportioned image placeholder (§4.3).
 * Real photography is pending — every instance keeps a descriptive ID alt and
 * a true aspect ratio so layout is stable (no CLS) when real photos drop in.
 *
 * TODO: replace with next/image + assets under /public/images/{category}.
 */

export type PlaceholderCategory =
  | 'food'
  | 'ingredients'
  | 'product'
  | 'process'
  | 'lifestyle';

const ratioClass = {
  landscape: 'aspect-[4/3]',
  portrait: 'aspect-[3/4]',
  square: 'aspect-square',
  wide: 'aspect-[16/9]',
} as const;

// Warm, true-to-life tones per subject — never cold studio white.
const categoryTone: Record<PlaceholderCategory, string> = {
  food: 'from-terracotta-20 to-gold-20',
  ingredients: 'from-marker-kapau/20 to-gold-20',
  product: 'from-cream-deep to-gold-20',
  process: 'from-terracotta-20 to-cream-deep',
  lifestyle: 'from-gold-20 to-blush',
};

const categoryLabel: Record<PlaceholderCategory, string> = {
  food: 'Foto hidangan',
  ingredients: 'Foto bahan',
  product: 'Foto kemasan',
  process: 'Foto proses',
  lifestyle: 'Foto suasana',
};

export function Placeholder({
  category,
  alt,
  ratio = 'landscape',
  className,
  priority = false,
}: {
  category: PlaceholderCategory;
  alt: string;
  ratio?: keyof typeof ratioClass;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={alt}
      data-priority={priority ? 'true' : undefined}
      className={cn(
        'flex items-center justify-center bg-gradient-to-br',
        ratioClass[ratio],
        categoryTone[category],
        className,
      )}
    >
      <span className="select-none font-sans text-label uppercase tracking-[0.2em] text-ink/35">
        {categoryLabel[category]}
      </span>
    </div>
  );
}
