import sanitizeHtml from 'sanitize-html';

/**
 * Rich-text HTML allow-list (articles, text sections). Everything not listed
 * — scripts, styles, event handlers, iframes, javascript: URLs — is removed.
 * Used both when saving (DB never stores unsafe HTML) and when rendering.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'a',
    'ul', 'ol', 'li', 'blockquote', 'figure', 'figcaption', 'img', 'hr', 'code',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https'] },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href ?? '';
      const external = /^https?:\/\//i.test(href);
      return {
        tagName,
        attribs: {
          href,
          ...(attribs.title ? { title: attribs.title } : {}),
          ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
        },
      };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
    b: 'strong',
    i: 'em',
  },
  exclusiveFilter: (frame) => frame.tag === 'img' && !/^(\/media\/|https:\/\/)/.test(frame.attribs.src ?? ''),
};

export function sanitizeRichText(html: unknown): string {
  if (typeof html !== 'string' || !html.trim()) return '';
  return sanitizeHtml(html, OPTIONS).trim();
}

export * from './text';
