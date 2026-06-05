import { cn } from '@/lib/utils';
import { DiamondDivider } from './DiamondDivider';

/**
 * Consistent vertical rhythm wrapper (§8). Sections breathe — generous
 * whitespace is a brand requirement (§3.5).
 */
export function Section({
  children,
  className,
  id,
  /** Optional eyebrow + heading rendered with calm spacing (no underline). */
  eyebrow,
  title,
  intro,
  /** Draw a diamond divider above this section. */
  dividerAbove = false,
}: {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  dividerAbove?: boolean;
}) {
  return (
    <section id={id} className={cn('py-section', className)}>
      {dividerAbove && <DiamondDivider className="!pt-0" />}
      <div className="container-dama">
        {(eyebrow || title || intro) && (
          <header className="mb-10 max-w-prose sm:mb-14">
            {eyebrow && (
              <p className="mb-3 font-sans text-label font-semibold uppercase tracking-[0.18em] text-terracotta">
                {eyebrow}
              </p>
            )}
            {title && <h2 className="text-display-md">{title}</h2>}
            {intro && <p className="mt-4 text-body-lg text-ink-soft">{intro}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
