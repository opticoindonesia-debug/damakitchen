import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook';

/**
 * On-demand revalidation endpoint (Sanity → Vercel).
 *
 * Configure a Sanity webhook to POST here on create/update/delete with the
 * projection: { "_type": _type, "slug": slug.current }. The request is signed;
 * we verify it with SANITY_REVALIDATE_SECRET before refreshing pages.
 *
 * Effect: edits appear within seconds (lazy regeneration on next request),
 * not the ~1h ISR window — and without a full redeploy.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'SANITY_REVALIDATE_SECRET belum diset di server.' },
      { status: 500 },
    );
  }

  const signature = req.headers.get(SIGNATURE_HEADER_NAME) ?? '';
  const body = await req.text();

  const valid = await isValidSignature(body, signature, secret);
  if (!valid) {
    return NextResponse.json({ ok: false, error: 'Signature tidak valid.' }, { status: 401 });
  }

  let payload: { _type?: string; slug?: string } = {};
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ ok: false, error: 'Body bukan JSON.' }, { status: 400 });
  }
  const { _type, slug } = payload;

  // Sub-brands appear in the nav/footer (every page) and most content feeds
  // several pages, so refresh everything under the root layout. This is
  // on-demand regeneration, not a rebuild — cheap and instant.
  revalidatePath('/', 'layout');

  // Dynamic detail routes also need their specific path refreshed so new or
  // renamed slugs regenerate.
  if (_type === 'journalPost') {
    revalidatePath('/catatan-dapur');
    if (slug) revalidatePath(`/catatan-dapur/${slug}`);
  }
  if (_type === 'page' && slug) {
    revalidatePath(`/${slug}`);
  }

  return NextResponse.json({
    ok: true,
    revalidated: true,
    type: _type ?? null,
    slug: slug ?? null,
    at: new Date().toISOString(),
  });
}
