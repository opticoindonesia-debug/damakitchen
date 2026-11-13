import 'server-only';
import mysql from 'mysql2/promise';
import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from './schema';

/**
 * Single shared MySQL connection pool (Hostinger MySQL / MariaDB).
 * DATABASE_URL format: mysql://USER:PASSWORD@HOST:3306/DATABASE
 */
type Db = MySql2Database<typeof schema>;
const g = globalThis as unknown as { __damaPool?: mysql.Pool; __damaDb?: Db };

export function getPool(): mysql.Pool {
  if (!g.__damaPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set. See .env.example.');
    g.__damaPool = mysql.createPool({
      uri: url,
      // Shared hosting has low process/connection limits — keep the pool small.
      connectionLimit: Number(process.env.DATABASE_POOL_SIZE ?? 5),
      waitForConnections: true,
      charset: 'utf8mb4',
      timezone: 'Z',
      dateStrings: false,
      enableKeepAlive: true,
    });
  }
  return g.__damaPool;
}

export function getDb(): Db {
  if (!g.__damaDb) g.__damaDb = drizzle(getPool(), { schema, mode: 'default' });
  return g.__damaDb;
}

/** Convenience proxy so modules can `import { db }` and stay lazy. */
export const db = new Proxy({} as Db, {
  get: (_t, prop) => Reflect.get(getDb() as object, prop),
});

export { schema };
