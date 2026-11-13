'use server';

import { redirect } from 'next/navigation';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import { ensureReady } from '@/lib/bootstrap';
import { DUMMY_HASH, hashPassword, passwordProblem, verifyPassword } from '@/lib/auth/password';
import { clientIp, createSession, destroySession, destroyUserSessions } from '@/lib/auth/session';
import { LOCKOUT_MINUTES, loginBlocked, recordLogin } from '@/lib/auth/rateLimit';
import { setupTokenValid } from '@/lib/auth/setup';
import { cleanText } from '@/lib/text';

export type FormState = { error?: string; ok?: string } | undefined;

const normEmail = (v: FormDataEntryValue | null) => String(v ?? '').trim().toLowerCase().slice(0, 190);

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  await ensureReady();
  const email = normEmail(form.get('email'));
  const password = String(form.get('password') ?? '');
  const ip = clientIp();
  if (!email || !password) return { error: 'Isi email dan kata sandi.' };
  if (await loginBlocked(email, ip)) {
    return { error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${LOCKOUT_MINUTES} menit.` };
  }
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  // Always run the hash (dummy when the user doesn't exist) — no timing leak.
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok || !user.isActive) {
    await recordLogin(email, ip, false);
    return { error: 'Email atau kata sandi salah.' };
  }
  await recordLogin(email, ip, true);
  await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, user.id));
  await createSession(user.id);
  const next = String(form.get('next') ?? '');
  redirect(/^\/admin(\/[\w\-/]*)?$/.test(next) ? next : '/admin');
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}

/**
 * First-run setup (no admin yet) or emergency password reset.
 * Both require ADMIN_SETUP_TOKEN from the server environment — a random value
 * the owner sets in hPanel, never a default password.
 */
export async function setupAction(_prev: FormState, form: FormData): Promise<FormState> {
  await ensureReady();
  const token = String(form.get('token') ?? '');
  const ip = clientIp();
  if (await loginBlocked('__setup__', ip)) return { error: `Terlalu banyak percobaan. Coba lagi dalam ${LOCKOUT_MINUTES} menit.` };
  if (!setupTokenValid(token)) {
    await recordLogin('__setup__', ip, false);
    return { error: 'Kode setup salah atau ADMIN_SETUP_TOKEN belum diatur di server.' };
  }
  const email = normEmail(form.get('email'));
  const name = cleanText(form.get('name'), 120).trim() || 'Pemilik';
  const password = String(form.get('password') ?? '');
  const confirm = String(form.get('confirm') ?? '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Email tidak valid.' };
  if (password !== confirm) return { error: 'Konfirmasi kata sandi tidak sama.' };
  const problem = passwordProblem(password, email);
  if (problem) return { error: problem };

  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(adminUsers);
  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  const hash = await hashPassword(password);
  if (Number(n) === 0) {
    await db.insert(adminUsers).values({ email, name, passwordHash: hash, role: 'owner' });
  } else if (existing) {
    // Reset: new password, active again, all old sessions signed out.
    await db.update(adminUsers).set({ passwordHash: hash, isActive: true }).where(eq(adminUsers.id, existing.id));
    await destroyUserSessions(existing.id);
  } else {
    return { error: 'Akun admin sudah ada. Untuk reset, masukkan email akun yang sudah terdaftar.' };
  }
  await recordLogin('__setup__', ip, true);
  return { ok: 'Akun siap. Silakan masuk. Setelah itu, hapus ADMIN_SETUP_TOKEN dari pengaturan server.' };
}
