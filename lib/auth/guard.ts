import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionUser, type AdminUser } from './session';

/** For admin pages: redirects to the login page when not signed in. */
export async function requireAdminPage(role?: 'owner'): Promise<AdminUser> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (role === 'owner' && user.role !== 'owner') redirect('/admin');
  return user;
}

export class AuthError extends Error {
  constructor(message = 'Sesi berakhir. Silakan masuk lagi.') {
    super(message);
  }
}

/**
 * For server actions. Next.js already rejects cross-origin action calls
 * (Origin vs Host check); we additionally require a valid session.
 */
export async function requireAdmin(role?: 'owner'): Promise<AdminUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError();
  if (role === 'owner' && user.role !== 'owner') throw new AuthError('Hanya pemilik (owner) yang boleh melakukan ini.');
  return user;
}

/**
 * CSRF protection for route handlers (uploads, backups): the request must
 * come from this same site (Origin/Referer host == Host).
 */
export function sameOrigin(req: Request): boolean {
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const origin = req.headers.get('origin') ?? req.headers.get('referer');
  if (!host || !origin) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** For route handlers: returns the admin or null (caller responds 401). */
export async function adminFromRequest(req: Request, opts: { mutating?: boolean; role?: 'owner' } = {}): Promise<AdminUser | null> {
  if (opts.mutating && !sameOrigin(req)) return null;
  const user = await getSessionUser();
  if (!user) return null;
  if (opts.role === 'owner' && user.role !== 'owner') return null;
  return user;
}
