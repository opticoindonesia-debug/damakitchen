import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { dataset, projectId } from '@/sanity/env';

const builder = imageUrlBuilder({ projectId: projectId || 'placeholder', dataset });

/**
 * Build an optimized image URL from a Sanity image ref.
 * Returns undefined when the source is missing so callers fall back to a placeholder.
 */
export function urlForImage(source: SanityImageSource | undefined | null, width = 1200) {
  if (!source) return undefined;
  try {
    return builder.image(source).width(width).auto('format').fit('max').url();
  } catch {
    return undefined;
  }
}
