import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { media } from '@/lib/db/schema';
import { ensureReady } from '@/lib/bootstrap';
import { adminFromRequest } from '@/lib/auth/guard';
import { MediaError, deleteMedia, mediaUsage, replaceUpload } from '@/lib/media';
import { cleanText, slugify } from '@/lib/text';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function load(id: string) {
  const n = Number(id);
  if (!Number.isInteger(n)) return null;
  const [row] = await db.select().from(media).where(eq(media.id, n));
  return row ?? null;
}

/** Usage report (where is this file used?). */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  await ensureReady();
  if (!(await adminFromRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const row = await load(params.id);
  if (!row) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
  return NextResponse.json({ usage: await mediaUsage(row.storageKey) });
}

/** Update alt text / description / folder. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await ensureReady();
  if (!(await adminFromRequest(req, { mutating: true }))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const row = await load(params.id);
  if (!row) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  await db
    .update(media)
    .set({
      alt: cleanText(body.alt ?? row.alt, 300),
      description: cleanText(body.description ?? row.description ?? '', 1000),
      folder: body.folder !== undefined ? slugify(String(body.folder), 60) : row.folder,
    })
    .where(eq(media.id, row.id));
  revalidateTag('cms');
  return NextResponse.json({ ok: true });
}

/** Replace the file (same URL everywhere it is used). */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await ensureReady();
  if (!(await adminFromRequest(req, { mutating: true }))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const row = await load(params.id);
  if (!row) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || typeof file !== 'object') return NextResponse.json({ error: 'Pilih file pengganti.' }, { status: 400 });
  try {
    await replaceUpload(row.id, Buffer.from(await (file as File).arrayBuffer()), (file as File).name || row.originalName);
  } catch (err) {
    if (err instanceof MediaError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error('[media] replace failed', err);
    return NextResponse.json({ error: 'Gagal mengganti file.' }, { status: 500 });
  }
  revalidateTag('cms');
  return NextResponse.json({ ok: true });
}

/** Delete. Refuses when the file is still used unless ?force=1 (after the admin confirmed the warning). */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await ensureReady();
  if (!(await adminFromRequest(req, { mutating: true }))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const row = await load(params.id);
  if (!row) return NextResponse.json({ ok: true });
  const usage = await mediaUsage(row.storageKey);
  const force = new URL(req.url).searchParams.get('force') === '1';
  if (usage.length && !force) return NextResponse.json({ error: 'in-use', usage }, { status: 409 });
  await deleteMedia(row.id);
  revalidateTag('cms');
  return NextResponse.json({ ok: true });
}
