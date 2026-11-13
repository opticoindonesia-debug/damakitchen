import 'server-only';
import { getPool } from '@/lib/db';
import { runMigrations } from '@/lib/db/migrate';
import { seedIfEmpty } from '@/lib/seed';

/**
 * Makes the database ready: applies pending migrations, then imports the
 * initial content into empty tables. Runs once per server process (on the
 * first request that touches the database) — no SSH/CLI step needed on Hostinger.
 */
const g = globalThis as unknown as { __damaReady?: Promise<void> };

export function ensureReady(): Promise<void> {
  if (!g.__damaReady) {
    g.__damaReady = (async () => {
      const applied = await runMigrations(getPool());
      if (applied.length) console.log(`[dama] migrations applied: ${applied.join(', ')}`);
      const seeded = await seedIfEmpty();
      if (seeded.length) console.log(`[dama] initial content imported: ${seeded.join(', ')}`);
    })().catch((err) => {
      g.__damaReady = undefined; // retry on next request
      throw err;
    });
  }
  return g.__damaReady;
}
