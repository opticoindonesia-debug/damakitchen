import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { redirects } from '@/lib/db/schema';

/**
 * Called when a published URL changes: old → new 301, and existing redirects
 * pointing at the old URL are re-pointed (no chains). A redirect FROM the new
 * URL is removed so the new page is reachable.
 */
export async function addSlugRedirect(from: string, to: string) {
  if (from === to) return;
  await db.delete(redirects).where(eq(redirects.fromPath, to));
  await db.update(redirects).set({ toPath: to }).where(eq(redirects.toPath, from));
  const [existing] = await db.select().from(redirects).where(eq(redirects.fromPath, from)).limit(1);
  if (existing) await db.update(redirects).set({ toPath: to, statusCode: 301 }).where(eq(redirects.id, existing.id));
  else await db.insert(redirects).values({ fromPath: from, toPath: to, statusCode: 301, note: 'Otomatis: alamat diubah' });
}
