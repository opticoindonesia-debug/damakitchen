import { NextResponse, type NextRequest } from 'next/server';

/**
 * First line of defense for the admin: no session cookie → no admin page.
 * The cookie is then fully validated against the database by every admin
 * page, server action and API route (lib/auth/guard.ts).
 */
const noindex = (res: NextResponse) => {
  // Staging protection: never let a non-production deployment be indexed.
  if (process.env.SITE_INDEXING !== 'true') res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) return noindex(NextResponse.next());
  const hasSession = Boolean(req.cookies.get('dama_admin')?.value);
  if (pathname.startsWith('/api/admin')) {
    if (!hasSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.next();
  }
  if (pathname === '/admin/login' || pathname === '/admin/setup') return NextResponse.next();
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = pathname === '/admin' ? '' : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next's static assets (needed for the staging noindex header).
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
