import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Art-directed image holder (§4.3).
 *
 * When `src` points at a real asset it renders next/image (responsive,
 * object-cover, LCP-priority aware). Until real photography lands it renders a
 * warm, correctly-proportioned placeholder — same aspect ratio, so dropping in
 * a photo causes no layout shift. Either way it carries a descriptive ID alt.
 *
 * Real photos drop in by setting `src` (e.g. "/images/food/rendang.jpg").
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

/** Sensible responsive sizes by aspect; overridable per instance. */
const defaultSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px';

export function Placeholder({
  category,
  alt,
  ratio = 'landscape',
  className,
  priority = false,
  src,
  sizes,
}: {
  category: PlaceholderCategory;
  alt: string;
  ratio?: keyof typeof ratioClass;
  className?: string;
  priority?: boolean;
  /** Real asset path. When set, renders next/image instead of the placeholder. */
  src?: string;
  sizes?: string;
}) {
  if (src) {
    return (
      <div className={cn('relative', ratioClass[ratio], className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? defaultSizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

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
