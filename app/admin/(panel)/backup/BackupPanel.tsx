'use client';

import { useRef, useState } from 'react';
import { Button, Card, Field, Input, NoticeBar, Toggle, confirmAction, type Notice } from '@/components/admin/ui';
import { refreshSiteCache } from '@/app/admin/actions/settings';

export function BackupPanel({ isOwner, storage, scheduled }: { isOwner: boolean; storage: string; scheduled: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState('');
  const [users, setUsers] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  if (!isOwner) return <Card><p className="text-sm text-stone-600">Hanya pemilik yang bisa mengunduh dan memulihkan cadangan.</p></Card>;

  async function restore() {
    const f = fileRef.current?.files?.[0];
    if (!f) return setNotice({ tone: 'error', text: 'Pilih file cadangan (.json.gz) terlebih dahulu.' });
    if (!confirmAction('SEMUA isi website saat ini akan diganti dengan isi cadangan. Lanjutkan?')) return;
    setBusy(true);
    const fd = new FormData();
    fd.append('file', f);
    fd.append('confirm', confirm);
    if (users) fd.append('includeUsers', '1');
    const res = await fetch('/api/admin/backup/restore', { method: 'POST', body: fd });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setNotice({ tone: 'success', text: `Pemulihan berhasil dari cadangan ${new Date(j.createdAt).toLocaleString('id-ID')}.`, details: Object.entries(j.summary as Record<string, number>).map(([k, v]) => `${k}: ${v}`) });
      setConfirm('');
    } else setNotice({ tone: 'error', text: j.error ?? 'Pemulihan gagal. Tidak ada data yang diubah.' });
  }

  return (
    <div className="space-y-5">
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      <Card title="1. Unduh cadangan" description="Berisi semua konten, pengaturan, akun admin (kata sandi terenkripsi) dan foto. Simpan di luar server, minimal seminggu sekali dan sebelum perubahan besar.">
        <a href="/api/admin/backup" className="inline-flex min-h-[40px] items-center rounded-md bg-[#1F4D4D] px-4 text-sm font-medium text-white hover:bg-[#173b3b]" data-testid="backup-download">
          Unduh cadangan sekarang (.json.gz)
        </a>
        <p className="mt-3 text-xs text-stone-500">Media disimpan di {storage === 'database' ? 'database, jadi foto ikut di file cadangan dan di cadangan database Hostinger' : 'folder server (MEDIA_ROOT), foto ikut di file cadangan ini'}.</p>
      </Card>
      <Card title="2. Cadangan otomatis" description="Lihat docs/DAMA_DATABASE_AND_BACKUP_GUIDE.md.">
        <p className="text-sm text-stone-700">
          {scheduled ? '✅ Cadangan terjadwal aktif (BACKUP_DIR & BACKUP_CRON_TOKEN terpasang). Pastikan Cron Job di hPanel berjalan dan salin file ke luar server secara berkala.' : 'Belum aktif. Hostinger juga membuat cadangan otomatis harian/mingguan (hPanel → Files → Backups). Untuk cadangan aplikasi terjadwal, atur BACKUP_DIR, BACKUP_CRON_TOKEN dan Cron Job sesuai panduan.'}
        </p>
      </Card>
      <Card title="3. Pulihkan dari cadangan" description="Mengganti SELURUH isi website dengan isi file cadangan. Semua langkah dilakukan sekaligus: jika gagal, tidak ada yang berubah. Unduh cadangan terbaru dulu sebelum memulihkan.">
        <div className="grid max-w-lg gap-3">
          <Field label="File cadangan (.json.gz)" htmlFor="restore-file"><input ref={fileRef} id="restore-file" type="file" accept=".gz,application/gzip" className="text-sm" /></Field>
          <Toggle checked={users} onChange={setUsers} label="Pulihkan juga akun admin dari cadangan" />
          <Field label='Ketik "PULIHKAN" untuk konfirmasi' htmlFor="restore-confirm"><Input id="restore-confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" /></Field>
          <div><Button variant="danger" busy={busy} disabled={confirm !== 'PULIHKAN'} onClick={restore}>Pulihkan sekarang</Button></div>
        </div>
      </Card>
      <Card title="4. Muat ulang data website" description="Gunakan setelah pemulihan lewat CLI/phpMyAdmin atau impor konten, agar website langsung menampilkan data terbaru (tanpa ini, paling lambat 5 menit).">
        <Button onClick={async () => {
          const res = await refreshSiteCache();
          setNotice(res.ok ? { tone: 'success', text: res.message ?? 'Selesai.' } : { tone: 'error', text: res.error });
        }}>Muat ulang data website</Button>
      </Card>
    </div>
  );
}
