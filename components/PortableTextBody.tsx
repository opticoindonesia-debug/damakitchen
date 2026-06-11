import { PortableText, type PortableTextComponents, type PortableTextProps } from '@portabletext/react';
import { urlForImage } from '@/lib/sanity/image';

/**
 * Renders Sanity Portable Text (journal posts + free pages) in DAMA's
 * editorial style: serif headings/quotes, left-aligned body, calm spacing.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-5 text-body-lg text-ink-soft">{children}</p>,
    h2: ({ children }) => <h2 className="mb-4 mt-12 text-display-md text-teal">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-3 mt-8 text-heading text-teal">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-2 border-terracotta pl-6 font-display text-display-md italic text-teal">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-5 list-disc space-y-2 pl-6 text-body-lg text-ink-soft">{children}</ul>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal underline underline-offset-4"
      >
        {children}
      </a>
    ),
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

export function PortableTextBody({ value }: { value: unknown }) {
  if (!value) return null;
  return <PortableText value={value as PortableTextProps['value']} components={components} />;
}
