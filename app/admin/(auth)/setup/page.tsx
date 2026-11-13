import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { ensureReady } from '@/lib/bootstrap';
import { setupTokenConfigured } from '@/lib/auth/setup';
import { AuthShell } from '../AuthShell';
import { SetupForm } from '../AuthForms';

export default async function SetupPage() {
  await ensureReady();
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(adminUsers);
  const firstRun = Number(n) === 0;
  return (
    <AuthShell
      title={firstRun ? 'Buat akun pemilik' : 'Atur ulang kata sandi'}
      footer={!firstRun && <Link href="/admin/login" className="underline underline-offset-4">Kembali ke halaman masuk</Link>}
    >
      {setupTokenConfigured() ? (
        <SetupForm firstRun={firstRun} />
      ) : (
        <div className="space-y-3 text-sm text-stone-700">
          <p>Untuk alasan keamanan, langkah ini hanya bisa dilakukan oleh orang yang memegang akses server.</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Buka hPanel → Websites → Node.js → Environment variables.</li>
            <li>Tambahkan <code className="rounded bg-stone-100 px-1">ADMIN_SETUP_TOKEN</code> berisi kode acak minimal 16 karakter.</li>
            <li>Simpan &amp; restart aplikasi, lalu buka halaman ini lagi.</li>
          </ol>
          <p>Panduan lengkap: <em>docs/DAMA_CMS_OWNER_MANUAL.md</em>.</p>
        </div>
      )}
    </AuthShell>
  );
}
