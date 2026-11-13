import { MediaLibrary } from '@/components/admin/media';
import { PageHeader } from '@/components/admin/ui';

export default function MediaPage() {
  return (
    <>
      <PageHeader
        title="Media"
        description="Semua foto dan file website. Foto otomatis diperkecil & dioptimalkan (WebP), data lokasi (GPS) di foto dihapus demi privasi."
      />
      <MediaLibrary />
    </>
  );
}
