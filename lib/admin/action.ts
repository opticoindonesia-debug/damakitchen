import 'server-only';
import { revalidateTag } from 'next/cache';
import { ensureReady } from '@/lib/bootstrap';
import { AuthError, requireAdmin } from '@/lib/auth/guard';
import type { AdminUser } from '@/lib/auth/session';
import type { ActionResult } from './result';

export class UserError extends Error {
  constructor(message: string, public problems?: string[]) {
    super(message);
  }
}

/**
 * Wraps every admin server action: DB ready → authorization check →
 * run → consistent result. Unexpected errors are logged server-side and a
 * safe, generic message is returned (no stack traces or SQL to the browser).
 */
export async function adminAction<T>(
  fn: (user: AdminUser) => Promise<T | ActionResult<T>>,
  opts: { role?: 'owner'; revalidate?: boolean } = {},
): Promise<ActionResult<T>> {
  try {
    await ensureReady();
    const user = await requireAdmin(opts.role);
    const out = await fn(user);
    if (opts.revalidate !== false) revalidateTag('cms');
    if (out && typeof out === 'object' && 'ok' in (out as object)) return out as ActionResult<T>;
    return { ok: true, data: out as T };
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, error: err.message };
    if (err instanceof UserError) return { ok: false, error: err.message, problems: err.problems };
    const code = (err as { code?: string })?.code;
    if (code === 'ER_DUP_ENTRY') return { ok: false, error: 'Data dengan alamat/slug yang sama sudah ada. Gunakan yang lain.' };
    console.error('[admin] action failed', err);
    return { ok: false, error: 'Terjadi kesalahan di server. Perubahan belum tersimpan — coba lagi.' };
  }
}
