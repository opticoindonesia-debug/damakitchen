'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { adminAction, UserError } from '@/lib/admin/action';
import { cleanNavigation, cleanSiteSettings, cleanTheme, DEFAULT_THEME } from '@/lib/settings';

type Key = 'site' | 'theme' | 'navigation';
const KEYS: Key[] = ['site', 'theme', 'navigation'];

function clean(key: Key, input: unknown): { data: Record<string, unknown>; problems: string[] } {
  if (key === 'site') {
    const r = cleanSiteSettings(input);
    return { data: r.data as unknown as Record<string, unknown>, problems: r.problems };
  }
  if (key === 'theme') return { data: cleanTheme(input) as unknown as Record<string, unknown>, problems: [] };
  const r = cleanNavigation(input);
  return { data: r.data as unknown as Record<string, unknown>, problems: r.problems };
}

async function upsert(key: Key, patch: Partial<typeof settings.$inferInsert>) {
  const [row] = await db.select({ key: settings.key }).from(settings).where(eq(settings.key, key)).limit(1);
  if (row) await db.update(settings).set(patch).where(eq(settings.key, key));
  else await db.insert(settings).values({ key, draft: {}, ...patch } as typeof settings.$inferInsert);
}

/** Saves the working copy only (website unchanged until "Terbitkan"). */
export async function saveSettingsDraft(key: Key, input: unknown) {
  return adminAction(async (user) => {
    if (!KEYS.includes(key)) throw new UserError('Pengaturan tidak dikenal.');
    const { data, problems } = clean(key, input);
    await upsert(key, { draft: data, hasChanges: true, updatedBy: user.id });
    return problems.length ? { ok: false as const, error: 'Draf tersimpan, tetapi ada yang perlu diperbaiki:', problems } : { ok: true as const, message: 'Draf tersimpan.', data };
  }, { revalidate: false });
}

export async function publishSettings(key: Key, input: unknown) {
  return adminAction(async (user) => {
    if (!KEYS.includes(key)) throw new UserError('Pengaturan tidak dikenal.');
    const { data, problems } = clean(key, input);
    if (problems.length) throw new UserError('Belum bisa diterbitkan. Perbaiki dulu:', problems);
    await upsert(key, { draft: data, published: data, hasChanges: false, publishedAt: new Date(), updatedBy: user.id });
    return { ok: true as const, message: 'Diterbitkan. Perubahan sudah tampil di website.', data };
  });
}

export async function discardSettings(key: Key) {
  return adminAction(async () => {
    const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (!row?.published) throw new UserError('Belum ada versi yang diterbitkan.');
    await db.update(settings).set({ draft: row.published, hasChanges: false }).where(eq(settings.key, key));
    return { ok: true as const, message: 'Perubahan dibatalkan.', data: row.published };
  }, { revalidate: false });
}

/** Restores the DAMA brand palette + default design tokens (as a draft). */
export async function resetThemeDraft() {
  return adminAction(async (user) => {
    await upsert('theme', { draft: DEFAULT_THEME as unknown as Record<string, unknown>, hasChanges: true, updatedBy: user.id });
    return { ok: true as const, message: 'Tampilan dikembalikan ke warna asli DAMA (sebagai draf). Klik Terbitkan untuk menerapkan.', data: DEFAULT_THEME };
  }, { revalidate: false });
}

/** Clears the website's data cache (e.g. after a CLI restore or import). */
export async function refreshSiteCache() {
  return adminAction(async () => ({ ok: true as const, message: 'Data website dimuat ulang. Perubahan dari luar admin kini tampil.' }));
}
