'use server';

import { and, asc, eq, inArray, ne, or } from 'drizzle-orm';
import { db } from '@/lib/db';
import { articleCategories, articleTags, articles, tags } from '@/lib/db/schema';
import { adminAction, UserError } from '@/lib/admin/action';
import { cleanSeo } from '@/lib/admin/seo';
import { addSlugRedirect } from '@/lib/admin/redirects';
import { sanitizeRichText } from '@/lib/sanitize';
import { SLUG_RE, cleanImage, cleanText, slugify } from '@/lib/text';

export interface ArticleInput {
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  featuredImage: unknown;
  author: string;
  categoryId: number | null;
  publishedAt: string; // yyyy-mm-dd
  tags: string[];
  relatedIds: number[];
  shortAnswer: string;
  sources: { title: string; url: string }[];
  relatedProducts: string[];
  seo: unknown;
}

async function load(id: number) {
  const [row] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!row) throw new UserError('Artikel tidak ditemukan.');
  return row;
}

function cleanArticle(input: ArticleInput) {
  const problems: string[] = [];
  const title = cleanText(input.title, 200).trim();
  if (!title) throw new UserError('Judul artikel wajib diisi.');
  const slug = slugify(input.slug || title);
  if (!SLUG_RE.test(slug)) throw new UserError('Alamat artikel (slug) tidak valid.');
  const date = /^\d{4}-\d{2}-\d{2}$/.test(input.publishedAt ?? '') ? new Date(`${input.publishedAt}T08:00:00Z`) : null;
  return {
    problems,
    data: {
      title,
      slug,
      excerpt: cleanText(input.excerpt, 600).trim() || null,
      bodyHtml: sanitizeRichText(input.bodyHtml),
      featuredImage: cleanImage(input.featuredImage) ?? null,
      author: cleanText(input.author, 120).trim() || null,
      categoryId: Number.isInteger(input.categoryId) ? input.categoryId : null,
      publishedAt: date,
      relatedIds: (input.relatedIds ?? []).filter((n) => Number.isInteger(n)).slice(0, 6),
      shortAnswer: cleanText(input.shortAnswer, 600).trim() || null,
      sources: (input.sources ?? []).slice(0, 15).flatMap((src, i) => {
        const t = cleanText(src?.title, 200).trim();
        const u = String(src?.url ?? '').trim();
        if (!t && !u) return [];
        if (!t || !/^https:\/\/\S+$/.test(u)) {
          problems.push(`Sumber ${i + 1}: isi judul dan tautan https:// yang valid.`);
          return [];
        }
        return [{ title: t, url: u }];
      }),
      relatedProducts: (input.relatedProducts ?? []).filter((x) => SLUG_RE.test(x)).slice(0, 8),
      seo: cleanSeo(input.seo, problems),
    },
    tagNames: [...new Set((input.tags ?? []).map((t) => cleanText(t, 60).trim()).filter(Boolean))].slice(0, 15),
  };
}

async function checkSlug(slug: string, id: number) {
  const clash = await db
    .select({ id: articles.id })
    .from(articles)
    .where(and(ne(articles.id, id), or(eq(articles.slug, slug), eq(articles.publishedSlug, slug))))
    .limit(1);
  if (clash.length) throw new UserError(`Alamat "/catatan-dapur/${slug}" sudah dipakai artikel lain.`);
}

async function syncTags(articleId: number, names: string[]) {
  const ids: number[] = [];
  for (const name of names) {
    const slug = slugify(name, 80);
    if (!slug) continue;
    const [found] = await db.select({ id: tags.id }).from(tags).where(eq(tags.slug, slug)).limit(1);
    if (found) ids.push(found.id);
    else ids.push((await db.insert(tags).values({ slug, name }))[0].insertId);
  }
  await db.delete(articleTags).where(eq(articleTags.articleId, articleId));
  if (ids.length) await db.insert(articleTags).values([...new Set(ids)].map((tagId) => ({ articleId, tagId })));
}

/** The public snapshot: everything the article page needs, frozen at publish. */
async function snapshot(id: number) {
  const a = await load(id);
  const cat = a.categoryId ? (await db.select().from(articleCategories).where(eq(articleCategories.id, a.categoryId)).limit(1))[0] : undefined;
  const tagRows = await db.select({ slug: tags.slug, name: tags.name }).from(articleTags).innerJoin(tags, eq(tags.id, articleTags.tagId)).where(eq(articleTags.articleId, id));
  return {
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt ?? undefined,
    bodyHtml: a.bodyHtml,
    featuredImage: a.featuredImage,
    author: a.author ?? undefined,
    publishedAt: (a.publishedAt ?? new Date()).toISOString(),
    category: cat ? { slug: cat.slug, name: cat.name } : null,
    tags: tagRows,
    seo: a.seo,
    relatedIds: a.relatedIds,
    shortAnswer: a.shortAnswer ?? undefined,
    sources: a.sources ?? [],
    relatedProducts: a.relatedProducts ?? [],
    modifiedAt: new Date().toISOString(),
  };
}

export async function createArticle(input: { title: string }) {
  return adminAction(async (user) => {
    const title = cleanText(input.title, 200).trim() || 'Artikel baru';
    let slug = slugify(title) || 'artikel';
    for (let i = 2; (await db.select({ id: articles.id }).from(articles).where(or(eq(articles.slug, slug), eq(articles.publishedSlug, slug)))).length; i++) slug = `${slugify(title)}-${i}`;
    const [res] = await db.insert(articles).values({ title, slug, bodyHtml: '', relatedIds: [], seo: {}, status: 'draft', hasChanges: true, publishedAt: new Date(), updatedBy: user.id });
    return { id: res.insertId };
  }, { revalidate: false });
}

export async function saveArticleDraft(id: number, input: ArticleInput) {
  return adminAction(async (user) => {
    await load(id);
    const { data, tagNames, problems } = cleanArticle(input);
    await checkSlug(data.slug, id);
    await db.update(articles).set({ ...data, hasChanges: true, updatedBy: user.id }).where(eq(articles.id, id));
    await syncTags(id, tagNames);
    return problems.length ? { ok: false as const, error: 'Draf tersimpan, tetapi perlu diperbaiki:', problems } : { ok: true as const, message: 'Draf tersimpan.' };
  }, { revalidate: false });
}

export async function publishArticle(id: number, input: ArticleInput) {
  return adminAction(async (user) => {
    const row = await load(id);
    const { data, tagNames, problems } = cleanArticle(input);
    if (!data.bodyHtml) problems.push('Isi artikel masih kosong.');
    if (problems.length) throw new UserError('Belum bisa diterbitkan. Perbaiki dulu:', problems);
    await checkSlug(data.slug, id);
    await db.update(articles).set({ ...data, publishedAt: data.publishedAt ?? new Date(), updatedBy: user.id }).where(eq(articles.id, id));
    await syncTags(id, tagNames);
    const snap = await snapshot(id);
    const oldSlug = row.status === 'published' ? row.publishedSlug : null;
    await db.update(articles).set({ published: snap, publishedSlug: snap.slug, status: 'published', hasChanges: false }).where(eq(articles.id, id));
    if (oldSlug && oldSlug !== snap.slug) await addSlugRedirect(`/catatan-dapur/${oldSlug}`, `/catatan-dapur/${snap.slug}`);
    return { ok: true as const, message: 'Artikel diterbitkan dan tampil di Catatan Dapur.' };
  });
}

export async function unpublishArticle(id: number) {
  return adminAction(async () => {
    await db.update(articles).set({ status: 'draft', published: null, publishedSlug: null, hasChanges: true }).where(eq(articles.id, id));
    return { ok: true as const, message: 'Artikel tidak lagi tampil (kembali menjadi draf).' };
  });
}

export async function discardArticleChanges(id: number) {
  return adminAction(async () => {
    const row = await load(id);
    const pub = row.published as Record<string, unknown> | null;
    if (!pub) throw new UserError('Artikel ini belum pernah diterbitkan.');
    await db
      .update(articles)
      .set({
        title: pub.title as string,
        slug: pub.slug as string,
        excerpt: (pub.excerpt as string) ?? null,
        bodyHtml: pub.bodyHtml as string,
        featuredImage: (pub.featuredImage as never) ?? null,
        author: (pub.author as string) ?? null,
        seo: (pub.seo as never) ?? {},
        relatedIds: (pub.relatedIds as number[]) ?? [],
        publishedAt: pub.publishedAt ? new Date(pub.publishedAt as string) : null,
        hasChanges: false,
      })
      .where(eq(articles.id, id));
    await syncTags(id, ((pub.tags as { name: string }[]) ?? []).map((t) => t.name));
    return { ok: true as const, message: 'Perubahan dibatalkan.' };
  });
}

export async function deleteArticle(id: number) {
  return adminAction(async () => {
    await db.delete(articles).where(eq(articles.id, id));
    return { ok: true as const, message: 'Artikel dihapus.' };
  });
}

export async function saveArticleCategories(rows: { id?: number; name: string; slug?: string; description?: string }[]) {
  return adminAction(async () => {
    const existing = await db.select().from(articleCategories);
    const keep = new Set<number>();
    for (const [i, r] of rows.entries()) {
      const name = cleanText(r.name, 120).trim();
      if (!name) continue;
      const data = { name, slug: slugify(r.slug || name), description: cleanText(r.description, 400).trim() || null, sortOrder: i };
      if (r.id && existing.some((e) => e.id === r.id)) {
        await db.update(articleCategories).set(data).where(eq(articleCategories.id, r.id));
        keep.add(r.id);
      } else keep.add((await db.insert(articleCategories).values(data))[0].insertId);
    }
    const remove = existing.filter((e) => !keep.has(e.id)).map((e) => e.id);
    if (remove.length) await db.delete(articleCategories).where(inArray(articleCategories.id, remove));
    const out = await db.select().from(articleCategories).orderBy(asc(articleCategories.sortOrder));
    return { ok: true as const, data: out.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? '' })), message: 'Kategori artikel disimpan.' };
  });
}
