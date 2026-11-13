/**
 * CLI backup: DATABASE_URL=… pnpm backup [output.json.gz]
 * Same format as Admin → Cadangan. Run from any machine that can reach the DB.
 */
import { writeFileSync } from 'node:fs';
import { createBackup } from '../lib/backup';
import { getPool } from '../lib/db';
import { ensureReady } from '../lib/bootstrap';

(async () => {
  await ensureReady();
  const out = process.argv[2] ?? `dama-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json.gz`;
  const { buffer, summary } = await createBackup(getPool(), { includeUsers: true });
  writeFileSync(out, buffer);
  console.log(`Backup written: ${out} (${(buffer.length / 1024).toFixed(0)} KB)`);
  console.table(summary);
  await getPool().end();
})().catch(async (e) => {
  console.error(e);
  await getPool().end().catch(() => undefined);
  process.exit(1);
});
