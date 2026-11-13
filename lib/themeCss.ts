import { themeOverrideCss } from '@/lib/theme';
import type { ThemeData } from '@/lib/settings';

/**
 * Turns the Appearance settings into CSS custom properties consumed by
 * Tailwind (colors, fonts, radius, button shape, spacing, container width).
 * Every value comes from a fixed allow-list, so the output is always safe to
 * inline in a <style> tag.
 */
const RADIUS: Record<ThemeData['radius'], [string, string, string]> = {
  none: ['0px', '0px', '0px'],
  small: ['4px', '6px', '10px'],
  medium: ['6px', '12px', '20px'],
  large: ['10px', '18px', '28px'],
};
const SPACING: Record<ThemeData['sectionSpacing'], string> = {
  compact: 'clamp(3rem, 7vw, 5.5rem)',
  normal: 'clamp(4rem, 10vw, 8rem)',
  spacious: 'clamp(5rem, 12vw, 10rem)',
};
const WIDTH: Record<ThemeData['containerWidth'], string> = {
  narrow: '1040px',
  normal: '1200px',
  wide: '1360px',
};

export function themeCss(t: ThemeData): string {
  const [sm, md, lg] = RADIUS[t.radius];
  const btn = t.buttonShape === 'pill' ? '999px' : t.buttonShape === 'square' ? '0px' : md;
  const vars = [
    `--font-heading:var(--font-${t.headingFont});`,
    `--font-body:var(--font-${t.bodyFont});`,
    `--radius-sm:${sm};--radius:${md};--radius-lg:${lg};--btn-radius:${btn};`,
    `--section-py:${SPACING[t.sectionSpacing]};`,
    `--container-max:${WIDTH[t.containerWidth]};`,
  ].join('');
  return `${themeOverrideCss(t.colors)}:root{${vars}}`;
}
