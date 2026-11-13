/**
 * CLI restore: DATABASE_URL=… pnpm restore <backup.json.gz> --yes [--with-users]
 * Replaces ALL content in the target database (single transaction).
 */
import { readFileSync } from 'node:fs';
import { parseBackup, restoreBackup } from '../lib/backup';
import { getPool } from '../lib/db';
import { ensureReady } from '../lib/bootstrap';

(async () => {
  const [file, ...flags] = process.argv.slice(2);
  if (!file || !flags.includes('--yes')) {
    console.error('Usage: pnpm restore <backup.json.gz> --yes [--with-users]\nThis REPLACES all content in the database at DATABASE_URL.');
    process.exit(2);
  }
  await ensureReady();
  const backup = parseBackup(readFileSync(file));
  const summary = await restoreBackup(getPool(), backup, { includeUsers: flags.includes('--with-users') });
  console.log(`Restored backup from ${backup.createdAt}`);
  console.table(summary);
  await getPool().end();
})().catch(async (e) => {
  console.error(e);
  await getPool().end().catch(() => undefined);
  process.exit(1);
});
