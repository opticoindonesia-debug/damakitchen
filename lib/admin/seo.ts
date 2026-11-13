import type { SeoFields } from '@/lib/db/schema';
import { cleanImage, cleanText } from '@/lib/text';

/** Validates SEO fields; invalid canonicals are rejected (not silently kept). */
export function cleanSeo(input: unknown, problems: string[]): SeoFields {
  const d = (input ?? {}) as Record<string, unknown>;
  const canonical = cleanText(d.canonical, 500).trim();
  let okCanonical = '';
  if (canonical) {
    if (/^\/(?!\/)\S*$/.test(canonical) || /^https:\/\/[^\s/]+\.\S*$/.test(canonical)) okCanonical = canonical;
    else problems.push('URL kanonis tidak valid (gunakan "/alamat" atau "https://…").');
  }
  const out: SeoFields = {
    title: cleanText(d.title, 120).trim() || undefined,
    description: cleanText(d.description, 320).trim() || undefined,
    canonical: okCanonical || undefined,
    ogTitle: cleanText(d.ogTitle, 120).trim() || undefined,
    ogDescription: cleanText(d.ogDescription, 320).trim() || undefined,
    ogImage: cleanImage(d.ogImage) ?? null,
    noindex: d.noindex === true,
  };
  return out;
}
