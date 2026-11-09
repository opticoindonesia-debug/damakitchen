import { PortableText, type PortableTextComponents, type PortableTextProps } from '@portabletext/react';
import { urlForImage } from '@/lib/sanity/image';
import { cn } from '@/lib/utils';

/**
 * Renders Sanity Portable Text (journal posts, free pages, page-builder text)
 * in DAMA's editorial style: serif headings/quotes, calm spacing.
 * `tone="dark"` switches to light text for dark section backgrounds.
 */
function buildComponents(tone: 'light' | 'dark', align: 'left' | 'center'): PortableTextComponents {
  const dark = tone === 'dark';
  const body = dark ? 'text-cream/90' : 'text-ink-soft';
  const heading = dark ? 'text-cream' : 'text-teal';
  const center = align === 'center' ? 'text-center' : '';
  return {
    block: {
      normal: ({ children }) => <p className={cn('mb-5 text-body-lg', body, center)}>{children}</p>,
      h2: ({ children }) => <h2 className={cn('mb-4 mt-12 text-display-md', heading, center)}>{children}</h2>,
      h3: ({ children }) => <h3 className={cn('mb-3 mt-8 text-heading', heading, center)}>{children}</h3>,
      blockquote: ({ children }) => (
        <blockquote
          className={cn(
            'my-8 border-l-2 pl-6 font-display text-display-md italic',
            dark ? 'border-gold text-cream' : 'border-terracotta text-teal',
          )}
        >
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className={cn('mb-5 list-disc space-y-2 pl-6 text-body-lg', body)}>{children}</ul>
      ),
    },
    marks: {
      strong: ({ children }) => (
        <strong className={cn('font-semibold', dark ? 'text-cream' : 'text-ink')}>{children}</strong>
      ),
      em: ({ children }) => <em>{children}</em>,
      link: ({ children, value }) => {
        const href: string = value?.href ?? '#';
        const external = /^https?:\/\//.test(href);
        return (
          <a
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={cn('underline underline-offset-4', dark ? 'text-cream' : 'text-teal')}
          >
            {children}
          </a>
        );
      },
    },
    types: {
      image: ({ value }) => {
        const url = urlForImage(value, 1200);
        if (!url) return null;
        return (
          <figure className="my-8 overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={value?.alt ?? ''} loading="lazy" className="h-auto w-full object-cover" />
          </figure>
        );
      },
    },
  };
}

export function PortableTextBody({
  value,
  tone = 'light',
  align = 'left',
}: {
  value: unknown;
  tone?: 'light' | 'dark';
  align?: 'left' | 'center';
}) {
  if (!value) return null;
  return (
    <PortableText value={value as PortableTextProps['value']} components={buildComponents(tone, align)} />
  );
}
