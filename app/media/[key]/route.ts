import { ensureReady } from '@/lib/bootstrap';
import { readMedia } from '@/lib/media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Serves self-hosted media: /media/<key>?w=640 picks the closest responsive variant. */
export async function GET(req: Request, { params }: { params: { key: string } }) {
  await ensureReady();
  const w = Number(new URL(req.url).searchParams.get('w')) || undefined;
  const file = await readMedia(params.key, w);
  if (!file) return new Response('Not found', { status: 404 });
  const headers: Record<string, string> = {
    'Content-Type': file.mime,
    ETag: file.etag,
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  };
  if (file.kind === 'document') {
    headers['Content-Disposition'] = `inline; filename="${file.name.replace(/[^\w.\- ]/g, '_')}"`;
  }
  if (req.headers.get('if-none-match') === file.etag) return new Response(null, { status: 304, headers });
  return new Response(new Uint8Array(file.data), { headers });
}
