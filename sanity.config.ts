'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { apiVersion, dataset, projectId } from '@/sanity/env';
import { schemaTypes } from '@/sanity/schemaTypes';
import { structure } from '@/sanity/structure';

/**
 * Sanity Studio config. Embedded in the Next app at /studio.
 * projectId falls back to a placeholder so the app still builds before a real
 * Sanity project is created — the Studio only works once env vars are set.
 */
export default defineConfig({
  name: 'dama-kitchen',
  title: 'DAMA KITCHEN',
  basePath: '/studio',
  projectId: projectId || 'placeholder',
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
});
