import 'server-only';
import { gunzipSync, gzipSync } from 'node:zlib';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import { MIGRATIONS } from './db/migrations.generated';

/**
 * Application-level backup: every content table (including media bytes when
 * MEDIA_STORAGE=database, or files under MEDIA_ROOT for filesystem storage)
 * in one gzipped JSON file. Restores into the same schema version.
 *
 * Never included: sessions and login attempts. Admin accounts are included
 * (hashed passwords only) and restored only when explicitly requested.
 */

export const BACKUP_FORMAT = 'dama-backup';
export const BACKUP_VERSION = 1;

/** Restore order respects foreign keys (parents first). */
export const CONTENT_TABLES = [
  'settings',
  'media',
  'media_blobs',
  'sub_brands',
  'product_categories',
  'products',
  'article_categories',
  'tags',
  'articles',
  'article_tags',
  'pages',
  'testimonials',
  'faqs',
  'brand_items',
  'redirects',
  'inquiries',
] as const;
export const USER_TABLES = ['admin_users'] as const;

type Cell = unknown;

function encode(v: Cell): Cell {
  if (Buffer.isBuffer(v)) return { $b64: v.toString('base64') };
  if (v instanceof Date) return { $date: v.toISOString() };
  return v;
}
function decode(v: Cell): Cell {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    if (typeof o.$b64 === 'string') return Buffer.from(o.$b64, 'base64');
    if (typeof o.$date === 'string') return new Date(o.$date);
    return JSON.stringify(v); // native MySQL JSON value
  }
  if (Array.isArray(v)) return JSON.stringify(v);
  return v;
}

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: number;
  createdAt: string;
  migrations: string[];
  mediaStorage: string;
  tables: Record<string, Record<string, Cell>[]>;
  files?: Record<string, string>; // filesystem media: "key/variant" → base64
}

export async function createBackup(pool: Pool, opts: { includeUsers?: boolean } = {}): Promise<{ buffer: Buffer; summary: Record<string, number> }> {
  const tables: BackupFile['tables'] = {};
  const summary: Record<string, number> = {};
  const list = [...CONTENT_TABLES, ...(opts.includeUsers !== false ? USER_TABLES : [])];
  for (const t of list) {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM ??', [t]);
    tables[t] = rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, encode(v)])));
    summary[t] = rows.length;
  }
  const file: BackupFile = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    migrations: MIGRATIONS.map((m) => m.id),
    mediaStorage: process.env.MEDIA_STORAGE === 'filesystem' ? 'filesystem' : 'database',
    tables,
  };
  const root = process.env.MEDIA_ROOT;
  if (root && path.isAbsolute(root)) {
    file.files = {};
    const fsMedia = (tables.media ?? []).filter((m) => m.storage === 'filesystem');
    for (const m of fsMedia) {
      const key = String(m.storage_key);
      const dir = path.join(root, key);
      for (const variant of await readdir(dir).catch(() => [] as string[])) {
        file.files[`${key}/${variant}`] = (await readFile(path.join(dir, variant))).toString('base64');
      }
    }
    summary.files = Object.keys(file.files).length;
  }
  return { buffer: gzipSync(Buffer.from(JSON.stringify(file))), summary };
}

export function parseBackup(buffer: Buffer): BackupFile {
  let json: BackupFile;
  try {
    json = JSON.parse(gunzipSync(buffer).toString('utf8'));
  } catch {
    throw new Error('File bukan cadangan DAMA yang valid (harus .json.gz dari menu Cadangan).');
  }
  if (json?.format !== BACKUP_FORMAT || typeof json.tables !== 'object') throw new Error('Format cadangan tidak dikenali.');
  if (json.version > BACKUP_VERSION) throw new Error('Cadangan dibuat oleh versi aplikasi yang lebih baru.');
  const known = new Set(MIGRATIONS.map((m) => m.id));
  const missing = (json.migrations ?? []).filter((m) => !known.has(m));
  if (missing.length) throw new Error(`Cadangan memerlukan versi database yang lebih baru (${missing.join(', ')}). Perbarui aplikasi dulu.`);
  return json;
}

async function insertRows(conn: PoolConnection, table: string, rows: Record<string, Cell>[], allowedCols: Set<string>) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]).filter((c) => allowedCols.has(c));
  const BATCH = table === 'media_blobs' ? 1 : 200;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const values = chunk.map((r) => cols.map((c) => decode(r[c])));
    await conn.query('INSERT INTO ?? (??) VALUES ?', [table, cols, values]);
  }
}

/**
 * Replaces all content with the backup's content in ONE transaction: if any
 * step fails, nothing is changed.
 */
export async function restoreBackup(pool: Pool, file: BackupFile, opts: { includeUsers?: boolean } = {}): Promise<Record<string, number>> {
  const tables = [...CONTENT_TABLES, ...(opts.includeUsers ? USER_TABLES : [])].filter((t) => Array.isArray(file.tables[t]));
  const conn = await pool.getConnection();
  const summary: Record<string, number> = {};
  try {
    await conn.beginTransaction();
    await conn.query('SET FOREIGN_KEY_CHECKS=0');
    for (const t of [...tables].reverse()) await conn.query('DELETE FROM ??', [t]);
    if (opts.includeUsers) await conn.query('DELETE FROM `sessions`');
    for (const t of tables) {
      const [cols] = await conn.query<RowDataPacket[]>('SHOW COLUMNS FROM ??', [t]);
      await insertRows(conn, t, file.tables[t], new Set(cols.map((c) => String(c.Field))));
      summary[t] = file.tables[t].length;
    }
    await conn.query('SET FOREIGN_KEY_CHECKS=1');
    await conn.commit();
  } catch (err) {
    await conn.rollback().catch(() => undefined);
    await conn.query('SET FOREIGN_KEY_CHECKS=1').catch(() => undefined);
    throw err;
  } finally {
    conn.release();
  }
  const root = process.env.MEDIA_ROOT;
  if (file.files && root && path.isAbsolute(root)) {
    for (const [rel, b64] of Object.entries(file.files)) {
      const [key, variant] = rel.split('/');
      if (!/^[a-z0-9][a-z0-9-]{0,140}\.(webp|gif|pdf)$/.test(key) || !/^(orig|\d{2,5})$/.test(variant)) continue;
      await mkdir(path.join(root, key), { recursive: true });
      await writeFile(path.join(root, key, variant), Buffer.from(b64, 'base64'));
    }
    summary.files = Object.keys(file.files).length;
  }
  return summary;
}

/** Writes a timestamped backup into BACKUP_DIR and keeps the newest N files. */
export async function writeScheduledBackup(pool: Pool): Promise<string> {
  const dir = process.env.BACKUP_DIR;
  if (!dir || !path.isAbsolute(dir)) throw new Error('BACKUP_DIR (absolute path) is not set');
  await mkdir(dir, { recursive: true });
  const { buffer } = await createBackup(pool);
  const name = `dama-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json.gz`;
  await writeFile(path.join(dir, name), buffer);
  const keep = Number(process.env.BACKUP_KEEP ?? 14);
  const all = (await readdir(dir)).filter((f) => f.startsWith('dama-backup-')).sort();
  const { rm } = await import('node:fs/promises');
  for (const old of all.slice(0, Math.max(0, all.length - keep))) await rm(path.join(dir, old), { force: true });
  return path.join(dir, name);
}
