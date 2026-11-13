/**
 * CLI: apply migrations and import initial content (same as server start).
 * Usage: DATABASE_URL=mysql://… pnpm db:setup
 */
import { ensureReady } from '../lib/bootstrap';
import { getPool } from '../lib/db';

ensureReady()
  .then(async () => {
    console.log('Database ready.');
    await getPool().end();
  })
  .catch(async (err) => {
    console.error(err);
    process.exit(1);
  });
