import { defineCliConfig } from 'sanity/cli';
import { dataset, projectId } from './sanity/env';

export default defineCliConfig({
  api: { projectId, dataset },
  /** Helpful for the embedded Studio + Next deploy on Vercel. */
  studioHost: 'dama-kitchen',
  autoUpdates: true,
});
