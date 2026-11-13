import 'server-only';
import type { Pool } from 'mysql2/promise';
import { MIGRATIONS } from './migrations.generated';

/**
 * Applies pending SQL migrations (embedded at build time). Safe to call on
 * every server start: applied migrations are recorded in `_migrations` and a
 * MySQL named lock prevents two processes migrating at once.
 * Migrations only ever ADD structure; destructive changes need a manual,
 * backed-up procedure (see docs/DAMA_DATABASE_AND_BACKUP_GUIDE.md).
 */
export async function runMigrations(pool: Pool): Promise<string[]> {
  const conn = await pool.getConnection();
  const applied: string[] = [];
  try {
    const [lock] = await conn.query<any[]>("SELECT GET_LOCK('dama_migrate', 60) AS l");
    if (!lock[0]?.l) throw new Error('Could not obtain migration lock');
    await conn.query(
      'CREATE TABLE IF NOT EXISTS `_migrations` (`id` varchar(190) NOT NULL PRIMARY KEY, `applied_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP) DEFAULT CHARSET=utf8mb4',
    );
    const [rows] = await conn.query<any[]>('SELECT id FROM `_migrations`');
    const done = new Set(rows.map((r) => r.id));
    for (const m of MIGRATIONS) {
      if (done.has(m.id)) continue;
      for (const stmt of m.statements) await conn.query(stmt);
      await conn.query('INSERT INTO `_migrations` (id) VALUES (?)', [m.id]);
      applied.push(m.id);
    }
    await conn.query("SELECT RELEASE_LOCK('dama_migrate')");
  } finally {
    conn.release();
  }
  return applied;
}
