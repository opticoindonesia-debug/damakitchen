import { ensureReady } from '@/lib/bootstrap';
import { adminFromRequest } from '@/lib/auth/guard';
import { getPool } from '@/lib/db';
import { createBackup } from '@/lib/backup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Owner-only: download a full backup (.json.gz). */
export async function GET(req: Request) {
  await ensureReady();
  if (!(await adminFromRequest(req, { role: 'owner' }))) return new Response('Unauthorized', { status: 401 });
  const { buffer } = await createBackup(getPool(), { includeUsers: true });
  const name = `dama-backup-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json.gz`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
    },
  });
}
