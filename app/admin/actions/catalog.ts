'use server';

import { and, asc, eq, ne, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { productCategories, products, subBrands } from '@/lib/db/schema';
import { adminAction, UserError } from '@/lib/admin/action';
import { cleanSeo } from '@/lib/admin/seo';
import { addSlugRedirect } from '@/lib/admin/redirects';
import { validateSections } from '@/lib/sections/validate';
import { CHANNEL_OPTIONS } from '@/lib/sections/definitions';
import { RESERVED_SLUGS } from '@/lib/pages';
import { SLUG_RE, cleanImage, cleanText, isSafeLink, slugify } from '@/lib/text';
import { parseHex } from '@/lib/theme';

const INFO = ['halal', 'pedas', 'sambal-terpisah', 'porsi'];
const IMAGE_CATS = ['food', 'product', 'ingredients', 'process', 'lifestyle'];
const AVAIL = ['available', 'preorder', 'seasonal', 'unavailable'] as const;
const STATUS = ['draft', 'published', 'archived'] as const;

// ── Products ──────────────────────────────────────────────────
export interface ProductInput {
  name: string;
  slug: string;
  subBrandId: number | null;
  categoryId: number | null;
  blurb: string;
  description: string;
  price: number | string | null;
  priceNote: string;
  availability: string;
  status: string;
  image: unknown;
  gallery: unknown;
  info: string[];
  imageCategory: string;
  orderLinks: { label: string; url: string }[];
  seo: unknown;
}

function cleanProduct(input: ProductInput) {
  const problems: string[] = [];
  const name = cleanText(input.name, 160).trim();
  if (!name) throw new UserError('Nama produk wajib diisi.');
  const slug = slugify(input.slug || name);
  if (!SLUG_RE.test(slug)) throw new UserError('Alamat produk (slug) tidak valid.');
  let price: number | null = null;
  if (input.price !== null && input.price !== '' && input.price !== undefined) {
    const n = Number(String(input.price).replace(/[^0-9]/g, ''));
    if (!Number.isFinite(n) || n < 0 || n > 1_000_000_000) problems.push('Harga tidak valid.');
    else price = Math.round(n);
  }
  const orderLinks = (Array.isArray(input.orderLinks) ? input.orderLinks : []).slice(0, 5).flatMap((l, i) => {
    const label = cleanText(l?.label, 80).trim();
    if (!label && !l?.url) return [];
    if (!label || !isSafeLink(l?.url) || !/^https?:\/\//.test(l.url)) {
      problems.push(`Tombol pesan ${i + 1}: isi tulisan dan tautan https:// yang valid.`);
      return [];
    }
    return [{ label, url: l.url.trim() }];
  });
  const gallery = (Array.isArray(input.gallery) ? input.gallery : []).slice(0, 12).map(cleanImage).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const data = {
    name,
    slug,
    subBrandId: Number.isInteger(input.subBrandId) ? input.subBrandId : null,
    categoryId: Number.isInteger(input.categoryId) ? input.categoryId : null,
    blurb: cleanText(input.blurb, 400).trim(),
    description: cleanText(input.description, 5000).trim() || null,
    price,
    priceNote: cleanText(input.priceNote, 120).trim() || null,
    availability: (AVAIL as readonly string[]).includes(input.availability) ? (input.availability as (typeof AVAIL)[number]) : 'available',
    status: (STATUS as readonly string[]).includes(input.status) ? (input.status as (typeof STATUS)[number]) : 'draft',
    image: cleanImage(input.image) ?? null,
    gallery,
    info: (input.info ?? []).filter((x) => INFO.includes(x)),
    imageCategory: IMAGE_CATS.includes(input.imageCategory) ? input.imageCategory : 'food',
    orderLinks,
    seo: cleanSeo(input.seo, problems),
  };
  return { data, problems };
}

export async function saveProduct(id: number | null, input: ProductInput) {
  return adminAction(async () => {
    const { data, problems } = cleanProduct(input);
    if (problems.length) throw new UserError('Periksa kembali isian berikut:', problems);
    const clash = await db.select({ id: products.id }).from(products).where(and(eq(products.slug, data.slug), id ? ne(products.id, id) : undefined)).limit(1);
    if (clash.length) throw new UserError(`Alamat "/menu/${data.slug}" sudah dipakai produk lain.`);
    if (id) {
      const [old] = await db.select({ slug: products.slug, status: products.status }).from(products).where(eq(products.id, id)).limit(1);
      if (!old) throw new UserError('Produk tidak ditemukan.');
      await db.update(products).set(data).where(eq(products.id, id));
      if (old.status === 'published' && old.slug !== data.slug) await addSlugRedirect(`/menu/${old.slug}`, `/menu/${data.slug}`);
      return { ok: true as const, data: { id }, message: data.status === 'published' ? 'Produk disimpan & tampil di website.' : 'Produk disimpan (tidak tampil di website).' };
    }
    const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${products.sortOrder}), 0)` }).from(products);
    const [res] = await db.insert(products).values({ ...data, sortOrder: Number(max) + 1 });
    return { ok: true as const, data: { id: res.insertId }, message: 'Produk dibuat.' };
  });
}

export async function setProductPrice(id: number, price: string) {
  return adminAction(async () => {
    const digits = String(price).replace(/[^0-9]/g, '');
    const value = digits ? Number(digits) : null;
    if (value !== null && value > 1_000_000_000) throw new UserError('Harga tidak valid.');
    await db.update(products).set({ price: value }).where(eq(products.id, id));
    return { ok: true as const, message: 'Harga diperbarui.' };
  });
}

export async function setProductStatus(id: number, status: string) {
  return adminAction(async () => {
    if (!(STATUS as readonly string[]).includes(status)) throw new UserError('Status tidak valid.');
    await db.update(products).set({ status: status as (typeof STATUS)[number] }).where(eq(products.id, id));
    return { ok: true as const, message: status === 'archived' ? 'Produk diarsipkan (tidak tampil).' : status === 'published' ? 'Produk ditampilkan.' : 'Produk disembunyikan (draf).' };
  });
}

export async function duplicateProduct(id: number) {
  return adminAction(async () => {
    const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!p) throw new UserError('Produk tidak ditemukan.');
    let slug = `${p.slug}-salinan`;
    for (let i = 2; (await db.select({ id: products.id }).from(products).where(eq(products.slug, slug))).length; i++) slug = `${p.slug}-salinan-${i}`;
    const rest: Partial<typeof p> = { ...p };
    delete rest.id;
    delete rest.createdAt;
    delete rest.updatedAt;
    const [res] = await db.insert(products).values({ ...(rest as typeof products.$inferInsert), slug, name: `${p.name} (salinan)`, status: 'draft', sortOrder: p.sortOrder + 1 });
    return { ok: true as const, data: { id: res.insertId }, message: 'Salinan dibuat sebagai draf.' };
  });
}

export async function deleteProduct(id: number) {
  return adminAction(async () => {
    await db.delete(products).where(eq(products.id, id));
    return { ok: true as const, message: 'Produk dihapus.' };
  });
}

export async function reorderProducts(ids: number[]) {
  return adminAction(async () => {
    for (const [i, id] of ids.entries()) await db.update(products).set({ sortOrder: i }).where(eq(products.id, id));
    return { ok: true as const };
  });
}

// ── Product categories ────────────────────────────────────────
export async function saveCategories(rows: { id?: number; name: string; slug?: string }[]) {
  return adminAction(async () => {
    const existing = await db.select().from(productCategories);
    const keep = new Set<number>();
    for (const [i, r] of rows.entries()) {
      const name = cleanText(r.name, 120).trim();
      if (!name) continue;
      const slug = slugify(r.slug || name);
      if (r.id && existing.some((e) => e.id === r.id)) {
        await db.update(productCategories).set({ name, slug, sortOrder: i }).where(eq(productCategories.id, r.id));
        keep.add(r.id);
      } else {
        const [res] = await db.insert(productCategories).values({ name, slug, sortOrder: i });
        keep.add(res.insertId);
      }
    }
    for (const e of existing) if (!keep.has(e.id)) await db.delete(productCategories).where(eq(productCategories.id, e.id));
    const out = await db.select().from(productCategories).orderBy(asc(productCategories.sortOrder));
    return { ok: true as const, data: out.map((c) => ({ id: c.id, name: c.name, slug: c.slug })), message: 'Kategori disimpan.' };
  });
}

// ── Sub-brands ────────────────────────────────────────────────
export interface SubBrandInput {
  slug: string;
  name: string;
  shortName: string;
  emotion: string;
  lead: string;
  about: string;
  howToOrder: string;
  channelNote: string;
  markerHex: string;
  heroImage: unknown;
  channels: string[];
  faqs: { q: string; a: string }[];
  crossSell: string[];
  extraSections: unknown;
  seo: unknown;
  enabled: boolean;
}

export async function saveSubBrand(id: number | null, input: SubBrandInput) {
  return adminAction(async () => {
    const problems: string[] = [];
    const name = cleanText(input.name, 120).trim();
    if (!name) throw new UserError('Nama sub-brand wajib diisi.');
    const slug = slugify(input.slug || name);
    if (!SLUG_RE.test(slug)) throw new UserError('Alamat (slug) tidak valid.');
    if (!id && RESERVED_SLUGS.filter((s) => !['lamak-dama', 'warisan-dama', 'hidang-basamo', 'dama-kapau', 'tando-mato'].includes(s)).includes(slug)) {
      throw new UserError(`Alamat "/${slug}" sudah dipakai halaman lain.`);
    }
    const marker = parseHex(input.markerHex) ? (input.markerHex.startsWith('#') ? input.markerHex : `#${input.markerHex}`).toUpperCase().slice(0, 7) : null;
    if (!marker) problems.push('Warna penanda harus berupa kode warna, mis. #1F7A6E.');
    const okChannels = new Set(CHANNEL_OPTIONS.map((o) => o.value));
    const { sections, problems: sp } = validateSections(input.extraSections, 'Bagian tambahan');
    problems.push(...sp);
    const data = {
      slug,
      name,
      shortName: cleanText(input.shortName, 60).trim() || name,
      emotion: cleanText(input.emotion, 60).trim(),
      lead: cleanText(input.lead, 600).trim(),
      about: cleanText(input.about, 3000).trim(),
      howToOrder: cleanText(input.howToOrder, 1500).trim(),
      channelNote: cleanText(input.channelNote, 300).trim() || null,
      markerHex: marker ?? '#1F7A6E',
      heroImage: cleanImage(input.heroImage) ?? null,
      channels: [...new Set((input.channels ?? []).filter((c) => okChannels.has(c)))],
      faqs: (input.faqs ?? []).slice(0, 30).flatMap((f) => {
        const q = cleanText(f?.q, 300).trim();
        const a = cleanText(f?.a, 2000).trim();
        return q && a ? [{ q, a }] : [];
      }),
      crossSell: (input.crossSell ?? []).filter((s) => SLUG_RE.test(s) && s !== slug).slice(0, 6),
      extraSections: sections,
      seo: cleanSeo(input.seo, problems),
      enabled: input.enabled !== false,
    };
    if (problems.length) throw new UserError('Periksa kembali isian berikut:', problems);
    if (id) {
      await db.update(subBrands).set(data).where(eq(subBrands.id, id));
      return { ok: true as const, data: { id }, message: data.enabled ? 'Sub-brand disimpan & tampil di website.' : 'Sub-brand disimpan (disembunyikan dari website).' };
    }
    const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${subBrands.sortOrder}), 0)` }).from(subBrands);
    const [res] = await db.insert(subBrands).values({ ...data, sortOrder: Number(max) + 1 });
    return { ok: true as const, data: { id: res.insertId }, message: 'Sub-brand dibuat.' };
  });
}

export async function reorderSubBrands(ids: number[]) {
  return adminAction(async () => {
    for (const [i, id] of ids.entries()) await db.update(subBrands).set({ sortOrder: i }).where(eq(subBrands.id, id));
    return { ok: true as const };
  });
}

export async function deleteSubBrand(id: number) {
  return adminAction(async () => {
    const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(products).where(eq(products.subBrandId, id));
    if (Number(n) > 0) throw new UserError(`Sub-brand ini masih punya ${n} produk. Pindahkan/hapus produknya dulu, atau cukup sembunyikan sub-brand ini.`);
    await db.delete(subBrands).where(eq(subBrands.id, id));
    return { ok: true as const, message: 'Sub-brand dihapus.' };
  });
}
