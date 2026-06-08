import 'server-only';
// Import from @sanity/client (pure) rather than next-sanity, whose entry pulls
// client-side preview components into the bundle.
import { createClient } from '@sanity/client';
import { apiVersion, dataset, projectId, sanityConfigured } from '@/sanity/env';

/**
 * Read-only Sanity client. Only used when a project id is configured;
 * otherwise the content layer falls back to the static /content files.
 */
export const sanityClient = createClient({
  projectId: projectId || 'placeholder',
  dataset,
  apiVersion,
  // Fetch fresh published content (no CDN lag) — pages are still cached by ISR.
  useCdn: false,
  perspective: 'published',
});

export { sanityConfigured };
