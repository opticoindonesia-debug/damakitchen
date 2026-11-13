import 'server-only';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { getRedirect } from '@/lib/cms';

/** Follows an admin-defined redirect for `path`, otherwise renders the 404 page. */
export async function redirectOrNotFound(path: string): Promise<never> {
  const r = await getRedirect(path.replace(/\/+$/, '') || '/');
  if (r) {
    if (r.code === 302 || r.code === 307) redirect(r.to);
    permanentRedirect(r.to);
  }
  notFound();
}
