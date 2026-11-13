import { sanitizeRichText } from '@/lib/sanitize';
import { cn } from '@/lib/utils';

/**
 * Renders CMS rich text (articles, text sections) in DAMA's editorial style.
 * HTML is sanitized on save AND here (defense in depth). Styles live in
 * globals.css under .rich-text; tone="dark" switches to light text.
 */
export function RichText({
  html,
  tone = 'light',
  align = 'left',
  className,
}: {
  html?: unknown;
  tone?: 'light' | 'dark';
  align?: 'left' | 'center';
  className?: string;
}) {
  const clean = sanitizeRichText(html);
  if (!clean) return null;
  return (
    <div
      className={cn('rich-text', tone === 'dark' && 'rich-text-dark', align === 'center' && 'rich-text-center', className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
