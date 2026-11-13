import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { ensureReady } from '@/lib/bootstrap';
import { getPool } from '@/lib/db';
import { writeScheduledBackup } from '@/lib/backup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Scheduled backup for a cron job (Hostinger hPanel → Cron Jobs):
 *   curl -fsS -X POST -H "x-backup-token: $TOKEN" https://domain/api/backup/cron
 * Writes into BACKUP_DIR (outside the app) and keeps the newest BACKUP_KEEP files.
 */
export async function POST(req: Request) {
  const expected = process.env.BACKUP_CRON_TOKEN ?? '';
  const got = req.headers.get('x-backup-token') ?? '';
  const ok = expected.length >= 24 && timingSafeEqual(createHash('sha256').update(got).digest(), createHash('sha256').update(expected).digest());
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureReady();
  try {
    const file = await writeScheduledBackup(getPool());
    return NextResponse.json({ ok: true, file: file.split('/').pop() });
  } catch (err) {
    console.error('[backup] scheduled backup failed', err);
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
  }
}
