import { requireAdminPage } from '@/lib/auth/guard';
import { storageDriver } from '@/lib/media';
import { PageHeader } from '@/components/admin/ui';
import { BackupPanel } from './BackupPanel';

export default async function BackupPage() {
  const me = await requireAdminPage();
  return (
    <>
      <PageHeader title="Cadangan" description="Unduh salinan lengkap isi website (teks, produk, artikel, pengaturan, foto) dan simpan di tempat lain (mis. Google Drive & laptop). Pulihkan bila terjadi kesalahan." />
      <BackupPanel isOwner={me.role === 'owner'} storage={storageDriver()} scheduled={Boolean(process.env.BACKUP_DIR && process.env.BACKUP_CRON_TOKEN)} />
    </>
  );
}
