import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Button (§8). Variants stay within approved pairings (§3.3); all sizes meet
 * the ≥44px tap target. Buttons transition background/opacity only (§3.6) —
 * no bounce, no spring.
 */

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded font-sans text-body font-medium transition-colors duration-300 ease-calm focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<Variant, string> = {
  // Cream on terracotta — approved AA pairing.
  primary: 'bg-terracotta text-cream hover:bg-terracotta-80',
  // Outline teal on cream — approved AA pairing.
  secondary: 'border border-teal/40 bg-transparent text-teal hover:bg-teal/5',
  ghost: 'bg-transparent text-teal hover:bg-teal/5',
};

const sizes: Record<Size, string> = {
  md: 'px-5 py-2.5',
  lg: 'px-7 py-3.5 text-body-lg',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; external?: boolean };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = 'primary', size = 'md', className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ('href' in props && props.href !== undefined) {
    const { href, external, variant: _v, size: _s, className: _c, ...rest } = props;
    const isExternal = external ?? /^https?:\/\//.test(href);
    if (isExternal) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, ...rest } = props as ButtonAsButton;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
