/**
 * Dependency-free text/link/image helpers, safe for client and server.
 */

export interface ImageValue {
  url: string;
  alt?: string;
  caption?: string;
  mediaId?: number;
}

/** Plain text: strips every tag and control character. */
export function cleanText(value: unknown, max = 500): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .slice(0, max);
}

/** A link editors may type: internal path, anchor, http(s), mailto, tel, or "whatsapp". */
export function isSafeLink(v: unknown): v is string {
  if (typeof v !== 'string') return false;
  const s = v.trim();
  if (!s) return false;
  if (s === 'whatsapp') return true;
  if (/^\/(?!\/)/.test(s) || s.startsWith('#')) return !/[\s<>"']/.test(s);
  if (/^(mailto:|tel:)/i.test(s)) return !/[<>"']/.test(s);
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Image URL stored in content: self-hosted /media/… or an https URL. */
export function isSafeImageUrl(v: unknown): v is string {
  if (typeof v !== 'string') return false;
  if (/^\/media\/[A-Za-z0-9._\-/]+(\?[A-Za-z0-9=&]*)?$/.test(v)) return true;
  if (/^\/images\/[A-Za-z0-9._\-/]+$/.test(v)) return true;
  try {
    return new URL(v).protocol === 'https:';
  } catch {
    return false;
  }
}

export function slugify(input: string, max = 120): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/g, '');
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function cleanImage(v: unknown): ImageValue | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  if (!isSafeImageUrl(o.url)) return undefined;
  return {
    url: o.url as string,
    ...(o.alt ? { alt: cleanText(o.alt, 300) } : {}),
    ...(o.caption ? { caption: cleanText(o.caption, 300) } : {}),
    ...(Number.isInteger(o.mediaId) ? { mediaId: o.mediaId as number } : {}),
  };
}
