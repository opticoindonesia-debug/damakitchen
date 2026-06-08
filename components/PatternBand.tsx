import { cn } from '@/lib/utils';

/**
 * Renders ONE motif as a band or faint background wash (§4.1).
 * Hard rules enforced here: opacity is capped low, and only one motif is ever
 * rendered per instance — never tile two motifs together.
 */

type Motif =
  | 'songket-geometric'
  | 'bunga-floral'
  | 'daun-leaf'
  | 'geometric-gold'
  | 'songket-festive'
  | 'none';

const motifFile: Record<string, string> = {
  'songket-geometric': '/patterns/songket-geometric.svg',
  'bunga-floral': '/patterns/bunga-floral.svg',
  'daun-leaf': '/patterns/daun-leaf.svg',
  'geometric-gold': '/patterns/geometric-gold.svg',
  'songket-festive': '/patterns/songket-festive.svg',
};

export function PatternBand({
  motif = 'songket-geometric',
  /** Custom uploaded motif image URL; overrides the preset when set. */
  src,
  /** Opacity is capped at 0.12 so a motif never overpowers content. */
  opacity = 0.06,
  className,
  as = 'wash',
}: {
  motif?: Motif;
  src?: string;
  opacity?: number;
  className?: string;
  /** 'wash' fills the parent faintly; 'band' is a slim horizontal strip. */
  as?: 'wash' | 'band';
}) {
  const image = src ?? (motif !== 'none' ? motifFile[motif] : undefined);
  if (!image) return null;
  const cappedOpacity = Math.min(opacity, 0.12);
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none bg-repeat',
        as === 'band' ? 'h-10 w-full' : 'absolute inset-0',
        className,
      )}
      style={{
        backgroundImage: `url(${image})`,
        opacity: cappedOpacity,
        backgroundSize: as === 'band' ? 'auto 100%' : undefined,
      }}
    />
  );
}
