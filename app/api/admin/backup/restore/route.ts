import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { ensureReady } from '@/lib/bootstrap';
import { adminFromRequest } from '@/lib/auth/guard';
import { getPool } from '@/lib/db';
import { parseBackup, restoreBackup } from '@/lib/backup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Owner-only: restore content from an uploaded backup (all-or-nothing). */
export async function POST(req: Request) {
  await ensureReady();
  if (!(await adminFromRequest(req, { mutating: true, role: 'owner' }))) return NextResponse.json({ error: 'Hanya pemilik yang boleh memulihkan cadangan.' }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || typeof file !== 'object') return NextResponse.json({ error: 'Pilih file cadangan.' }, { status: 400 });
  if (String(form?.get('confirm') ?? '') !== 'PULIHKAN') return NextResponse.json({ error: 'Ketik PULIHKAN untuk mengonfirmasi.' }, { status: 400 });
  try {
    const backup = parseBackup(Buffer.from(await (file as File).arrayBuffer()));
    const summary = await restoreBackup(getPool(), backup, { includeUsers: form?.get('includeUsers') === '1' });
    revalidateTag('cms');
    return NextResponse.json({ ok: true, createdAt: backup.createdAt, summary });
  } catch (err) {
    console.error('[backup] restore failed', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Pemulihan gagal. Tidak ada data yang diubah.' }, { status: 400 });
  }
}
