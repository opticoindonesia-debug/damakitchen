import 'server-only';
import { and, eq, gt, lt, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { loginAttempts } from '@/lib/db/schema';

/** Failed logins allowed per window before the account / IP is locked out. */
export const LOCKOUT_MINUTES = 15;
const MAX_PER_EMAIL = 5;
const MAX_PER_IP = 20;

export async function loginBlocked(email: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - LOCKOUT_MINUTES * 60_000);
  const count = async (cond: ReturnType<typeof eq>) => {
    const [r] = await db
      .select({ n: sql<number>`count(*)` })
      .from(loginAttempts)
      .where(and(cond, eq(loginAttempts.success, false), gt(loginAttempts.createdAt, since)));
    return Number(r?.n ?? 0);
  };
  return (await count(eq(loginAttempts.email, email))) >= MAX_PER_EMAIL || (await count(eq(loginAttempts.ip, ip))) >= MAX_PER_IP;
}

export async function recordLogin(email: string, ip: string, success: boolean): Promise<void> {
  await db.insert(loginAttempts).values({ email, ip, success });
  if (success) {
    await db.delete(loginAttempts).where(and(eq(loginAttempts.email, email), eq(loginAttempts.success, false)));
  }
  await db.delete(loginAttempts).where(lt(loginAttempts.createdAt, new Date(Date.now() - 864e5)));
}
