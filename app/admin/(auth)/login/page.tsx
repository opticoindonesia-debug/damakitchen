import Link from 'next/link';
import { redirect } from 'next/navigation';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { ensureReady } from '@/lib/bootstrap';
import { getSessionUser } from '@/lib/auth/session';
import { AuthShell } from '../AuthShell';
import { LoginForm } from '../AuthForms';

export default async function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  await ensureReady();
  if (await getSessionUser()) redirect('/admin');
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(adminUsers);
  if (Number(n) === 0) redirect('/admin/setup');
  return (
    <AuthShell
      title="Masuk ke Admin"
      footer={<Link href="/admin/setup" className="underline underline-offset-4">Lupa kata sandi?</Link>}
    >
      <LoginForm next={searchParams.next} />
    </AuthShell>
  );
}
