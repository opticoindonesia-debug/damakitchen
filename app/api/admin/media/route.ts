import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { and, desc, eq, like, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { media } from '@/lib/db/schema';
import { ensureReady } from '@/lib/bootstrap';
import { adminFromRequest } from '@/lib/auth/guard';
import { MediaError, saveUpload } from '@/lib/media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const toJson = (m: typeof media.$inferSelect) => ({
  id: m.id,
  key: m.storageKey,
  url: `/media/${m.storageKey}`,
  name: m.originalName,
  mime: m.mime,
  kind: m.kind,
  size: m.size,
  width: m.width,
  height: m.height,
  alt: m.alt,
  description: m.description ?? '',
  folder: m.folder,
  version: m.version,
  createdAt: m.createdAt,
});
export type MediaItem = ReturnType<typeof toJson>;

/** List / search the library. */
export async function GET(req: Request) {
  await ensureReady();
  if (!(await adminFromRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const q = (sp.get('q') ?? '').trim().slice(0, 100);
  const folder = sp.get('folder');
  const kind = sp.get('kind');
  const page = Math.max(1, Number(sp.get('page')) || 1);
  const conds = [];
  if (q) conds.push(or(like(media.originalName, `%${q}%`), like(media.alt, `%${q}%`), like(media.description, `%${q}%`)));
  if (folder !== null && folder !== '*') conds.push(eq(media.folder, folder));
  if (kind === 'image' || kind === 'document') conds.push(eq(media.kind, kind));
  const where = conds.length ? and(...conds) : undefined;
  const rows = await db.select().from(media).where(where).orderBy(desc(media.createdAt), desc(media.id)).limit(48).offset((page - 1) * 48);
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(media).where(where);
  const folders = await db.selectDistinct({ f: media.folder }).from(media).orderBy(media.folder);
  return NextResponse.json({ items: rows.map(toJson), total: Number(n), folders: folders.map((f) => f.f).filter(Boolean) });
}

/** Upload one or more files (multipart/form-data: files[], folder). */
export async function POST(req: Request) {
  await ensureReady();
  if (!(await adminFromRequest(req, { mutating: true }))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Unggahan tidak valid.' }, { status: 400 });
  }
  const files = form.getAll('files').filter((f): f is File => typeof f === 'object' && 'arrayBuffer' in f);
  if (!files.length) return NextResponse.json({ error: 'Pilih file terlebih dahulu.' }, { status: 400 });
  if (files.length > 20) return NextResponse.json({ error: 'Maksimal 20 file sekali unggah.' }, { status: 400 });
  const folder = String(form.get('folder') ?? '');
  const results: { name: string; item?: MediaItem; error?: string }[] = [];
  for (const f of files) {
    try {
      const row = await saveUpload({ buffer: Buffer.from(await f.arrayBuffer()), originalName: f.name || 'file', folder });
      results.push({ name: f.name, item: toJson(row) });
    } catch (err) {
      results.push({ name: f.name, error: err instanceof MediaError ? err.message : 'Gagal memproses file.' });
      if (!(err instanceof MediaError)) console.error('[media] upload failed', err);
    }
  }
  revalidateTag('cms');
  return NextResponse.json({ results });
}
