/**
 * Seed Sanity with the current placeholder content from /content.
 *
 * Idempotent: uses deterministic _id's + createOrReplace, so you can run it
 * again safely after editing the static files. It does NOT touch documents you
 * create later in the Studio (different ids).
 *
 * Usage:
 *   1. Create a write token at sanity.io/manage → API → Tokens (Editor role).
 *   2. Put these in .env.local (or export them in your shell):
 *        NEXT_PUBLIC_SANITY_PROJECT_ID=...
 *        NEXT_PUBLIC_SANITY_DATASET=production
 *        SANITY_API_WRITE_TOKEN=...
 *   3. Run:  pnpm seed:sanity
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@sanity/client';
import { buildSeedDocs } from '../sanity/seedData';

// ── minimal .env.local loader (no extra deps) ─────────────────
function loadEnvLocal() {
  try {
    const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    // no .env.local — rely on shell env
  }
}
loadEnvLocal();

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN || '';

if (!projectId || !token) {
  console.error(
    '\n✗ Missing config. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN' +
      ' (in .env.local or your shell) before running.\n',
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01',
  token,
  useCdn: false,
});

async function main() {
  const docs = buildSeedDocs();
  console.log(`Seeding ${docs.length} documents to ${projectId}/${dataset}…`);

  const tx = client.transaction();
  for (const doc of docs) tx.createOrReplace(doc);
  await tx.commit();

  const counts = docs.reduce<Record<string, number>>((acc, d) => {
    acc[d._type] = (acc[d._type] ?? 0) + 1;
    return acc;
  }, {});
  console.log('✓ Done:', counts);
  console.log('Open /studio to edit. (Re-run anytime — it overwrites only these seeded docs.)');
}

main().catch((err: unknown) => {
  console.error('✗ Seeding failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
