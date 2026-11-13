'use server';

import { and, eq, ne, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { adminUsers, brandItems, faqs, inquiries, redirects, testimonials } from '@/lib/db/schema';
import { adminAction, UserError } from '@/lib/admin/action';
import { hashPassword, passwordProblem, verifyPassword } from '@/lib/auth/password';
import { destroyUserSessions } from '@/lib/auth/session';
import { cleanText, isSafeLink } from '@/lib/text';
import { ICON_OPTIONS } from '@/lib/sections/definitions';

// ── Collections ───────────────────────────────────────────────
export type CollectionKind = 'testimonials' | 'faqs' | 'pillars' | 'values';
export interface CollectionRow {
  id?: number;
  title: string; // name | question | title
  subtitle: string; // context | group | icon
  body: string; // quote | answer | body
  visible: boolean;
}

/** Replaces a collection with the edited list (insert / update / delete, keeps order). */
export async function saveCollection(kind: CollectionKind, rows: CollectionRow[]) {
  return adminAction(async () => {
    const clean = rows.slice(0, 100).map((r, i) => ({
      id: Number.isInteger(r.id) ? r.id : undefined,
      title: cleanText(r.title, 300).trim(),
      subtitle: cleanText(r.subtitle, 160).trim(),
      body: cleanText(r.body, 3000).trim(),
      visible: r.visible !== false,
      sortOrder: i,
    }));
    const bad = clean.findIndex((r) => !r.title || !r.body);
    if (bad >= 0) throw new UserError(`Baris ${bad + 1}: judul/nama dan isi wajib diisi.`);
    const keep = new Set<number>();
    if (kind === 'testimonials') {
      for (const r of clean) {
        const data = { name: r.title.slice(0, 120), context: r.subtitle, quote: r.body, visible: r.visible, sortOrder: r.sortOrder };
        if (r.id) { await db.update(testimonials).set(data).where(eq(testimonials.id, r.id)); keep.add(r.id); }
        else keep.add((await db.insert(testimonials).values(data))[0].insertId);
      }
      for (const e of await db.select({ id: testimonials.id }).from(testimonials)) if (!keep.has(e.id)) await db.delete(testimonials).where(eq(testimonials.id, e.id));
    } else if (kind === 'faqs') {
      for (const r of clean) {
        const data = { question: r.title, answer: r.body, groupKey: r.subtitle || 'umum', visible: r.visible, sortOrder: r.sortOrder };
        if (r.id) { await db.update(faqs).set(data).where(eq(faqs.id, r.id)); keep.add(r.id); }
        else keep.add((await db.insert(faqs).values(data))[0].insertId);
      }
      for (const e of await db.select({ id: faqs.id }).from(faqs)) if (!keep.has(e.id)) await db.delete(faqs).where(eq(faqs.id, e.id));
    } else {
      const k = kind === 'pillars' ? ('pillar' as const) : ('value' as const);
      const icons = new Set(ICON_OPTIONS.map((o) => o.value));
      for (const r of clean) {
        const data = { kind: k, title: r.title.slice(0, 160), body: r.body, icon: icons.has(r.subtitle) ? r.subtitle : null, visible: r.visible, sortOrder: r.sortOrder };
        if (r.id) { await db.update(brandItems).set(data).where(eq(brandItems.id, r.id)); keep.add(r.id); }
        else keep.add((await db.insert(brandItems).values(data))[0].insertId);
      }
      for (const e of await db.select({ id: brandItems.id }).from(brandItems).where(eq(brandItems.kind, k))) if (!keep.has(e.id)) await db.delete(brandItems).where(eq(brandItems.id, e.id));
    }
    return { ok: true as const, message: 'Tersimpan & tampil di website.' };
  });
}

// ── Redirects ─────────────────────────────────────────────────
export async function saveRedirect(id: number | null, input: { fromPath: string; toPath: string; statusCode: number; note: string }) {
  return adminAction(async () => {
    const from = cleanText(input.fromPath, 255).trim().replace(/\/+$/, '') || '/';
    const to = cleanText(input.toPath, 500).trim();
    if (!/^\/(?!\/)[^\s?#]*$/.test(from)) throw new UserError('Alamat lama harus diawali "/" (mis. /menu-lama).');
    if (from.startsWith('/admin') || from.startsWith('/api') || from.startsWith('/media')) throw new UserError('Alamat sistem tidak bisa dialihkan.');
    if (!isSafeLink(to) || to === 'whatsapp' || to.startsWith('#')) throw new UserError('Alamat tujuan harus diawali "/" atau "https://".');
    if (to === from) throw new UserError('Alamat tujuan sama dengan alamat lama.');
    const code = [301, 302].includes(Number(input.statusCode)) ? Number(input.statusCode) : 301;
    const data = { fromPath: from, toPath: to, statusCode: code, note: cleanText(input.note, 200).trim() || null };
    const clash = await db.select({ id: redirects.id }).from(redirects).where(and(eq(redirects.fromPath, from), id ? ne(redirects.id, id) : undefined)).limit(1);
    if (clash.length) throw new UserError(`Sudah ada pengalihan dari ${from}.`);
    if (id) await db.update(redirects).set(data).where(eq(redirects.id, id));
    else await db.insert(redirects).values(data);
    return { ok: true as const, message: 'Pengalihan disimpan.' };
  });
}

export async function deleteRedirect(id: number) {
  return adminAction(async () => {
    await db.delete(redirects).where(eq(redirects.id, id));
    return { ok: true as const, message: 'Pengalihan dihapus.' };
  });
}

// ── Account & users ───────────────────────────────────────────
export async function changePassword(input: { current: string; next: string; confirm: string }) {
  return adminAction(async (user) => {
    const [u] = await db.select().from(adminUsers).where(eq(adminUsers.id, user.id)).limit(1);
    if (!u || !(await verifyPassword(input.current ?? '', u.passwordHash))) throw new UserError('Kata sandi saat ini salah.');
    if (input.next !== input.confirm) throw new UserError('Konfirmasi kata sandi tidak sama.');
    const problem = passwordProblem(input.next, u.email);
    if (problem) throw new UserError(problem);
    await db.update(adminUsers).set({ passwordHash: await hashPassword(input.next) }).where(eq(adminUsers.id, u.id));
    return { ok: true as const, message: 'Kata sandi diganti.' };
  }, { revalidate: false });
}

export async function signOutEverywhere() {
  return adminAction(async (user) => {
    await destroyUserSessions(user.id);
    return { ok: true as const, message: 'Semua sesi ditutup. Silakan masuk lagi.' };
  }, { revalidate: false });
}

export async function createUser(input: { email: string; name: string; role: string; password: string }) {
  return adminAction(async () => {
    const email = String(input.email ?? '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new UserError('Email tidak valid.');
    const problem = passwordProblem(input.password, email);
    if (problem) throw new UserError(problem);
    await db.insert(adminUsers).values({
      email,
      name: cleanText(input.name, 120).trim() || email,
      role: input.role === 'owner' ? 'owner' : 'editor',
      passwordHash: await hashPassword(input.password),
    });
    return { ok: true as const, message: 'Pengguna dibuat. Berikan kata sandi sementara secara langsung (bukan lewat chat grup).' };
  }, { role: 'owner', revalidate: false });
}

export async function setUserActive(id: number, active: boolean) {
  return adminAction(async (user) => {
    if (id === user.id) throw new UserError('Anda tidak bisa menonaktifkan akun sendiri.');
    if (!active) {
      const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(adminUsers).where(and(eq(adminUsers.role, 'owner'), eq(adminUsers.isActive, true), ne(adminUsers.id, id)));
      const [target] = await db.select({ role: adminUsers.role }).from(adminUsers).where(eq(adminUsers.id, id));
      if (target?.role === 'owner' && Number(n) === 0) throw new UserError('Harus ada minimal satu pemilik aktif.');
    }
    await db.update(adminUsers).set({ isActive: active }).where(eq(adminUsers.id, id));
    if (!active) await destroyUserSessions(id);
    return { ok: true as const, message: active ? 'Pengguna diaktifkan.' : 'Pengguna dinonaktifkan dan dikeluarkan.' };
  }, { role: 'owner', revalidate: false });
}

export async function resetUserPassword(id: number, password: string) {
  return adminAction(async () => {
    const [u] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    if (!u) throw new UserError('Pengguna tidak ditemukan.');
    const problem = passwordProblem(password, u.email);
    if (problem) throw new UserError(problem);
    await db.update(adminUsers).set({ passwordHash: await hashPassword(password) }).where(eq(adminUsers.id, id));
    await destroyUserSessions(id);
    return { ok: true as const, message: 'Kata sandi pengguna diatur ulang.' };
  }, { role: 'owner', revalidate: false });
}

// ── Inquiries (leads) ─────────────────────────────────────────
const LEAD_STATUS = ['new', 'contacted', 'quoted', 'won', 'lost', 'spam'] as const;

export async function updateInquiry(id: number, input: { status: string; note: string }) {
  return adminAction(async () => {
    const status = (LEAD_STATUS as readonly string[]).includes(input.status) ? (input.status as (typeof LEAD_STATUS)[number]) : 'new';
    await db.update(inquiries).set({ status, note: cleanText(input.note, 2000).trim() || null }).where(eq(inquiries.id, id));
    return { ok: true as const, message: 'Disimpan.' };
  }, { revalidate: false });
}

export async function deleteInquiry(id: number) {
  return adminAction(async () => {
    await db.delete(inquiries).where(eq(inquiries.id, id));
    return { ok: true as const, message: 'Permintaan dihapus.' };
  }, { revalidate: false });
}
