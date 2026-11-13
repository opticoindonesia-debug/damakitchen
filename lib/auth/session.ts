import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { and, eq, gt, lt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { adminUsers, sessions } from '@/lib/db/schema';

export const SESSION_COOKIE = 'dama_admin';
const SESSION_DAYS = 7;

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'owner' | 'editor';
}

const hashToken = (t: string) => createHash('sha256').update(t).digest('hex');

export function clientIp(): string {
  const h = headers();
  return (h.get('x-forwarded-for')?.split(',')[0] ?? h.get('x-real-ip') ?? 'unknown').trim().slice(0, 64);
}

export const secureCookies = () => process.env.NODE_ENV === 'production' && process.env.INSECURE_COOKIES !== '1';

export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.insert(sessions).values({
    id: hashToken(token),
    userId,
    expiresAt,
    ip: clientIp(),
    userAgent: (headers().get('user-agent') ?? '').slice(0, 255),
  });
  // Opportunistic cleanup of expired sessions.
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: secureCookies(),
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

/** Current admin from the session cookie, or null. Validated against the DB on every call. */
export async function getSessionUser(): Promise<AdminUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const rows = await db
    .select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name, role: adminUsers.role, active: adminUsers.isActive })
    .from(sessions)
    .innerJoin(adminUsers, eq(adminUsers.id, sessions.userId))
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const u = rows[0];
  if (!u || !u.active) return null;
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}

export async function destroySession(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  cookies().delete(SESSION_COOKIE);
}

export async function destroyUserSessions(userId: number): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}
