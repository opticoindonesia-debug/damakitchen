'use server';

import { and, eq, ne, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { adminAction, UserError } from '@/lib/admin/action';
import { cleanSeo } from '@/lib/admin/seo';
import { addSlugRedirect } from '@/lib/admin/redirects';
import { validateSections } from '@/lib/sections/validate';
import { RESERVED_SLUGS } from '@/lib/pages';
import { SLUG_RE, cleanText, slugify } from '@/lib/text';

interface PageInput {
  title: string;
  slug: string;
  sections: unknown;
  seo: unknown;
}

async function load(id: number) {
  const [row] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
  if (!row) throw new UserError('Halaman tidak ditemukan.');
  return row;
}

async function checkSlug(slug: string, id: number) {
  if (!SLUG_RE.test(slug)) throw new UserError('Alamat (slug) hanya boleh huruf kecil, angka, dan tanda "-".');
  if (RESERVED_SLUGS.includes(slug)) throw new UserError(`Alamat "/${slug}" sudah dipakai oleh halaman bawaan website. Pilih alamat lain.`);
  const clash = await db
    .select({ id: pages.id })
    .from(pages)
    .where(and(ne(pages.id, id), or(eq(pages.slug, slug), eq(pages.publishedSlug, slug))))
    .limit(1);
  if (clash.length) throw new UserError(`Alamat "/${slug}" sudah dipakai halaman lain.`);
}

/** Validates a working copy; returns the cleaned document + non-blocking problems. */
async function cleanDoc(row: typeof pages.$inferSelect, input: PageInput) {
  const problems: string[] = [];
  const title = cleanText(input.title, 200).trim();
  if (!title) throw new UserError('Judul halaman wajib diisi.');
  const slug = row.builtinKey ? row.slug : slugify(input.slug || title);
  if (!row.builtinKey) await checkSlug(slug, row.id);
  const { sections, problems: sp } = validateSections(input.sections);
  problems.push(...sp);
  const seo = cleanSeo(input.seo, problems);
  return { doc: { title, slug, sections, seo }, problems };
}

export async function createPage(input: { title: string; slug?: string }) {
  return adminAction(async (user) => {
    const title = cleanText(input.title, 200).trim();
    if (!title) throw new UserError('Judul halaman wajib diisi.');
    const slug = slugify(input.slug || title);
    await checkSlug(slug, 0);
    const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${pages.sortOrder}), 0)` }).from(pages);
    const doc = { title, slug, sections: [], seo: {} };
    const [res] = await db.insert(pages).values({ title, slug, draft: doc, status: 'draft', hasChanges: true, sortOrder: Number(max) + 1, updatedBy: user.id });
    return { id: res.insertId };
  });
}

/** Save draft (also used by autosave). Never changes the live page. */
export async function savePageDraft(id: number, input: PageInput) {
  return adminAction(async (user) => {
    const row = await load(id);
    const { doc, problems } = await cleanDoc(row, input);
    await db.update(pages).set({ title: doc.title, slug: doc.slug, draft: doc, hasChanges: true, updatedBy: user.id }).where(eq(pages.id, id));
    return problems.length
      ? { ok: false as const, error: 'Draf tersimpan, tetapi ada isian yang perlu diperbaiki:', problems }
      : { ok: true as const, message: 'Draf tersimpan.' };
  }, { revalidate: false });
}

export async function publishPage(id: number, input: PageInput) {
  return adminAction(async (user) => {
    const row = await load(id);
    const { doc, problems } = await cleanDoc(row, input);
    if (problems.length) throw new UserError('Belum bisa diterbitkan. Perbaiki dulu:', problems);
    const oldSlug = row.status === 'published' ? row.publishedSlug : null;
    await db
      .update(pages)
      .set({ title: doc.title, slug: doc.slug, draft: doc, published: doc, publishedSlug: doc.slug, status: 'published', hasChanges: false, publishedAt: new Date(), updatedBy: user.id })
      .where(eq(pages.id, id));
    if (oldSlug !== null && oldSlug !== undefined && oldSlug !== doc.slug && !row.builtinKey) {
      await addSlugRedirect(`/${oldSlug}`, `/${doc.slug}`);
    }
    return { ok: true as const, message: 'Halaman diterbitkan. Perubahan sudah tampil di website.' };
  });
}

export async function unpublishPage(id: number) {
  return adminAction(async (user) => {
    const row = await load(id);
    if (row.builtinKey) throw new UserError('Halaman utama website tidak bisa disembunyikan. Anda bisa mengubah atau menyembunyikan bagian-bagiannya.');
    await db.update(pages).set({ status: 'draft', published: null, publishedSlug: null, hasChanges: true, updatedBy: user.id }).where(eq(pages.id, id));
    return { ok: true as const, message: 'Halaman tidak lagi tampil di website (kembali menjadi draf).' };
  });
}

export async function discardPageChanges(id: number) {
  return adminAction(async () => {
    const row = await load(id);
    if (!row.published) throw new UserError('Halaman ini belum pernah diterbitkan, tidak ada versi untuk dikembalikan.');
    const pub = row.published as { title: string; slug: string };
    await db.update(pages).set({ draft: row.published, title: pub.title, slug: pub.slug, hasChanges: false }).where(eq(pages.id, id));
    return { ok: true as const, message: 'Perubahan dibatalkan. Draf kembali sama dengan versi yang tayang.', data: row.published };
  });
}

export async function deletePage(id: number) {
  return adminAction(async () => {
    const row = await load(id);
    if (row.builtinKey) throw new UserError('Halaman utama website tidak bisa dihapus.');
    await db.delete(pages).where(eq(pages.id, id));
    return { ok: true as const, message: 'Halaman dihapus.' };
  });
}

export async function duplicatePage(id: number) {
  return adminAction(async (user) => {
    const row = await load(id);
    const base = (row.draft as { sections?: unknown[]; seo?: unknown }) ?? {};
    let slug = `${row.slug || 'beranda'}-salinan`;
    for (let i = 2; (await db.select({ id: pages.id }).from(pages).where(or(eq(pages.slug, slug), eq(pages.publishedSlug, slug)))).length; i++) {
      slug = `${row.slug || 'beranda'}-salinan-${i}`;
    }
    const title = `${row.title} (salinan)`;
    const doc = { title, slug, sections: base.sections ?? [], seo: {} };
    const [res] = await db.insert(pages).values({ title, slug, draft: doc, status: 'draft', hasChanges: true, sortOrder: row.sortOrder + 1, updatedBy: user.id });
    return { ok: true as const, data: { id: res.insertId }, message: 'Salinan dibuat sebagai draf.' };
  }, { revalidate: false });
}

export async function reorderPages(ids: number[]) {
  return adminAction(async () => {
    for (const [i, id] of ids.entries()) await db.update(pages).set({ sortOrder: i }).where(eq(pages.id, id));
    return { ok: true as const };
  }, { revalidate: false });
}
