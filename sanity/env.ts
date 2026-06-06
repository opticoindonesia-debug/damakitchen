/**
 * Sanity project config (read from env). The site works with zero Sanity setup:
 * when these are unset, the content layer falls back to the static files in
 * /content. Set them (after creating a Sanity project) to go live with the CMS.
 */
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';

/** True only when a real project id is configured. */
export const sanityConfigured = projectId.length > 0;
