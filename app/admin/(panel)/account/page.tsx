import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { requireAdminPage } from '@/lib/auth/guard';
import { PageHeader } from '@/components/admin/ui';
import { AccountEditor } from './AccountEditor';

export default async function AccountPage() {
  const me = await requireAdminPage();
  const users = me.role === 'owner'
    ? await db.select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name, role: adminUsers.role, isActive: adminUsers.isActive, lastLoginAt: adminUsers.lastLoginAt }).from(adminUsers).orderBy(asc(adminUsers.id))
    : [];
  return (
    <>
      <PageHeader title="Akun & pengguna" description="Ganti kata sandi Anda, dan (khusus pemilik) kelola siapa saja yang bisa masuk ke admin." />
      <AccountEditor me={me} users={users.map((u) => ({ ...u, lastLoginAt: u.lastLoginAt?.toISOString() ?? null }))} />
    </>
  );
}
