'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { dataset, projectId } from '@/sanity/env';
import { schemaTypes } from '@/sanity/schemaTypes';
import { structure } from '@/sanity/structure';

/**
 * Sanity Studio config, embedded at /studio.
 *
 * Kept intentionally simple for non-technical editors:
 * - no developer "Vision" tool
 * - "Pengaturan Situs" is a singleton (can't be duplicated/deleted)
 * - the global "＋ Create" hides the singleton to avoid confusion
 *
 * projectId falls back to a placeholder so the app still builds before a real
 * Sanity project is connected.
 */
export default defineConfig({
  name: 'dama-kitchen',
  title: 'DAMA KITCHEN — Kelola Konten',
  basePath: '/studio',
  projectId: projectId || 'placeholder',
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure })],
  document: {
    // Lock the settings singleton: no duplicate / delete / unpublish.
    actions: (prev, { schemaType }) =>
      schemaType === 'siteSettings'
        ? prev.filter(({ action }) => !['duplicate', 'delete', 'unpublish'].includes(action ?? ''))
        : prev,
    // Don't offer creating the singleton from the global "+ Create".
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter((t) => t.templateId !== 'siteSettings')
        : prev,
  },
});
