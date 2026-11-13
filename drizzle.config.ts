import { defineConfig } from 'drizzle-kit';

/** Used only in development to generate SQL migrations from lib/db/schema.ts. */
export default defineConfig({
  dialect: 'mysql',
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? 'mysql://root@localhost:3306/dama' },
});
