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
  /** Heading level for the section title. Use 'h1' when it's the page's main heading. */
  titleAs = 'h2',
  intro,
  /** Draw a diamond divider above this section. */
  dividerAbove = false,
}: {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  eyebrow?: string;
  title?: string;
  titleAs?: 'h1' | 'h2';
  intro?: string;
  dividerAbove?: boolean;
}) {
  const Title = titleAs;
  return (
    <section id={id} className={cn('py-section', className)}>
      {dividerAbove && <DiamondDivider className="!pt-0" />}
      <div className="container-dama">
        {(eyebrow || title || intro) && (
          <header className="mb-10 max-w-prose sm:mb-14">
            {eyebrow && (
              <p className="mb-3 font-sans text-label font-semibold uppercase tracking-[0.18em] text-terracotta-deep">
                {eyebrow}
              </p>
            )}
            {title && <Title className="text-display-md">{title}</Title>}
            {intro && <p className="mt-4 text-body-lg text-ink-soft">{intro}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
