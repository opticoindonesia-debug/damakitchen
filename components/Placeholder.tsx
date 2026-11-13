import { cn } from '@/lib/utils';

/**
 * Art-directed image holder (§4.3).
 *
 * When `src` is set it renders the photo (plain <img> straight from the source
 * CDN). Until real photography lands it renders a warm, correctly-proportioned
 * placeholder — same aspect ratio, so dropping in a photo causes no layout
 * shift. Either way it carries a descriptive ID alt.
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
    // Self-hosted media (/media/…) is already WebP with 640/1280/full-width
    // variants, so a responsive srcset is enough — no image-optimizer round trip.
    const local = src.startsWith('/media/') && !/\.(gif|pdf)$/.test(src);
    return (
      <div className={cn('relative overflow-hidden', ratioClass[ratio], className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={local ? `${src}?w=1280` : src}
          {...(local ? { srcSet: `${src}?w=640 640w, ${src}?w=1280 1280w, ${src} 2400w`, sizes: sizes ?? '100vw' } : {})}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
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
