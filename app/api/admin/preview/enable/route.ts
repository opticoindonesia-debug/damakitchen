import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { ensureReady } from '@/lib/bootstrap';

export const dynamic = 'force-dynamic';

/** Turns on preview (drafts) for the signed-in admin, then opens the page. */
export async function GET(req: Request) {
  await ensureReady();
  if (!(await getSessionUser())) return new Response('Unauthorized', { status: 401 });
  const path = new URL(req.url).searchParams.get('path') ?? '/';
  draftMode().enable();
  redirect(/^\/(?!\/)[\w\-/]*$/.test(path) ? path : '/');
}
