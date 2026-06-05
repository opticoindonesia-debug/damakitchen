import { cn } from '@/lib/utils';
import { Placeholder, type PlaceholderCategory } from './Placeholder';

/**
 * Art-directed image holder (§4.3). When a photo carries the logo or text,
 * a soft teal→transparent scrim (~35%) keeps overlays legible.
 *
 * Real photography is pending, so this currently renders a warm, correctly
 * proportioned <Placeholder>. TODO: replace with <Image> + real assets.
 */
export function ImageWithScrim({
  category,
  alt,
  ratio = 'landscape',
  rounded = true,
  scrim = false,
  warmBorder = false,
  priority = false,
  children,
  className,
}: {
  category: PlaceholderCategory;
  /** Warm, descriptive alt in DAMA's voice — never empty (§4.3). */
  alt: string;
  ratio?: 'landscape' | 'portrait' | 'square' | 'wide';
  rounded?: boolean;
  scrim?: boolean;
  warmBorder?: boolean;
  priority?: boolean;
  /** Overlay content (e.g. logo, headline) placed above the scrim. */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        'relative overflow-hidden',
        rounded && 'rounded-lg',
        warmBorder && 'border-4 border-cream-paper',
        className,
      )}
    >
      <Placeholder category={category} alt={alt} ratio={ratio} priority={priority} />
      {scrim && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(31,77,77,0.55) 0%, rgba(31,77,77,0.18) 45%, transparent 100%)',
          }}
        />
      )}
      {children && <div className="absolute inset-0">{children}</div>}
    </figure>
  );
}
