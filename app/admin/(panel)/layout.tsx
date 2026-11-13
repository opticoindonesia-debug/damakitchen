import { requireAdminPage } from '@/lib/auth/guard';
import { ensureReady } from '@/lib/bootstrap';
import { AdminNav } from '@/components/admin/AdminNav';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await ensureReady();
  const user = await requireAdminPage();
  return (
    <div className="lg:flex">
      <AdminNav user={{ name: user.name, email: user.email, role: user.role }} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
