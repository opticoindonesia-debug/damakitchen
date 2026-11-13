import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { media, mediaBlobs } from '@/lib/db/schema';
import { slugify } from '@/lib/text';

/**
 * Self-hosted media library.
 *
 * Storage drivers (MEDIA_STORAGE):
 *  - "database" (default): bytes live in MySQL (media_blobs). Survives every
 *    redeploy on Hostinger Managed Node.js and is included in DB backups.
 *  - "filesystem": bytes live under MEDIA_ROOT, which MUST be a persistent
 *    directory outside the deployed app (e.g. /home/<user>/dama-media on a VPS).
 *
 * Images are re-encoded with sharp: auto-rotated, metadata (EXIF/GPS)
 * stripped, converted to WebP, plus responsive width variants.
 */

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_DOC_BYTES = 8 * 1024 * 1024;
const VARIANT_WIDTHS = [640, 1280];
const MAX_WIDTH = 2400;

export type StorageDriver = 'database' | 'filesystem';

export function storageDriver(): StorageDriver {
  return process.env.MEDIA_STORAGE === 'filesystem' ? 'filesystem' : 'database';
}

function mediaRoot(): string {
  const root = process.env.MEDIA_ROOT;
  if (!root || !path.isAbsolute(root)) throw new Error('MEDIA_ROOT must be an absolute path when MEDIA_STORAGE=filesystem');
  return root;
}

const KEY_RE = /^[a-z0-9][a-z0-9-]{0,140}\.(webp|gif|pdf)$/;
export const isValidKey = (k: string) => KEY_RE.test(k);

export class MediaError extends Error {}

interface Processed {
  kind: 'image' | 'document';
  mime: string;
  ext: 'webp' | 'gif' | 'pdf';
  width: number | null;
  height: number | null;
  variants: { name: string; data: Buffer }[]; // 'orig' + widths
}

/** Validates by content (magic bytes), not by the client-supplied type. */
async function processFile(buf: Buffer): Promise<Processed> {
  if (buf.subarray(0, 5).toString('latin1') === '%PDF-') {
    if (buf.length > MAX_DOC_BYTES) throw new MediaError('Dokumen terlalu besar (maks. 8 MB).');
    return { kind: 'document', mime: 'application/pdf', ext: 'pdf', width: null, height: null, variants: [{ name: 'orig', data: buf }] };
  }
  if (buf.length > MAX_IMAGE_BYTES) throw new MediaError('Foto terlalu besar (maks. 8 MB).');
  let meta: sharp.Metadata;
  try {
    meta = await sharp(buf, { failOn: 'error' }).metadata();
  } catch {
    throw new MediaError('Jenis file tidak didukung. Gunakan JPG, PNG, WebP, AVIF, GIF atau PDF.');
  }
  const allowed = ['jpeg', 'png', 'webp', 'gif', 'avif', 'heif'];
  if (!meta.format || !allowed.includes(meta.format)) {
    throw new MediaError('Jenis file tidak didukung. Gunakan JPG, PNG, WebP, AVIF, GIF atau PDF (SVG tidak diizinkan demi keamanan).');
  }
  if ((meta.width ?? 0) * (meta.height ?? 0) > 60_000_000) throw new MediaError('Resolusi foto terlalu besar.');

  // Animated GIFs are kept as-is (re-encoding would drop animation).
  if (meta.format === 'gif' && (meta.pages ?? 1) > 1) {
    return { kind: 'image', mime: 'image/gif', ext: 'gif', width: meta.width ?? null, height: meta.pageHeight ?? meta.height ?? null, variants: [{ name: 'orig', data: buf }] };
  }

  const base = sharp(buf).rotate(); // apply EXIF orientation, then metadata is dropped
  const main = await base.clone().resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const variants = [{ name: 'orig', data: main.data }];
  for (const w of VARIANT_WIDTHS) {
    if (w >= main.info.width) continue;
    variants.push({ name: String(w), data: await base.clone().resize({ width: w }).webp({ quality: 80 }).toBuffer() });
  }
  return { kind: 'image', mime: 'image/webp', ext: 'webp', width: main.info.width, height: main.info.height, variants };
}

async function writeBytes(mediaId: number, key: string, mime: string, variants: Processed['variants']) {
  if (storageDriver() === 'filesystem') {
    const dir = path.join(mediaRoot(), key);
    await mkdir(dir, { recursive: true });
    for (const v of variants) await writeFile(path.join(dir, v.name), v.data);
    return;
  }
  await db.delete(mediaBlobs).where(eq(mediaBlobs.mediaId, mediaId));
  for (const v of variants) {
    await db.insert(mediaBlobs).values({ mediaId, variant: v.name, mime, size: v.data.length, data: v.data });
  }
}

export interface UploadInput {
  buffer: Buffer;
  originalName: string;
  folder?: string;
  alt?: string;
}

export async function saveUpload(input: UploadInput) {
  const p = await processFile(input.buffer);
  const stem = slugify(input.originalName.replace(/\.[^.]+$/, ''), 60) || 'file';
  const key = `${randomBytes(4).toString('hex')}-${stem}.${p.ext}`;
  const checksum = createHash('sha256').update(p.variants[0].data).digest('hex');
  const [res] = await db.insert(media).values({
    storageKey: key,
    originalName: input.originalName.slice(0, 255),
    mime: p.mime,
    kind: p.kind,
    size: p.variants[0].data.length,
    width: p.width,
    height: p.height,
    variants: p.variants.filter((v) => v.name !== 'orig').map((v) => Number(v.name)),
    storage: storageDriver(),
    checksum,
    alt: (input.alt ?? '').slice(0, 300),
    folder: slugify(input.folder ?? '', 60),
  });
  const id = res.insertId;
  try {
    await writeBytes(id, key, p.mime, p.variants);
  } catch (err) {
    await db.delete(media).where(eq(media.id, id));
    throw err;
  }
  const [row] = await db.select().from(media).where(eq(media.id, id));
  return row;
}

/** Replaces a file's content, keeping its URL (every page using it updates). */
export async function replaceUpload(id: number, buffer: Buffer, originalName: string) {
  const [row] = await db.select().from(media).where(eq(media.id, id));
  if (!row) throw new MediaError('Media tidak ditemukan.');
  const p = await processFile(buffer);
  if (p.ext !== row.storageKey.split('.').pop()) {
    throw new MediaError(`File pengganti harus berjenis sama (${row.kind === 'document' ? 'PDF' : 'foto'}).`);
  }
  if (row.storage === 'filesystem') await rm(path.join(mediaRoot(), row.storageKey), { recursive: true, force: true });
  await writeBytes(id, row.storageKey, p.mime, p.variants);
  await db
    .update(media)
    .set({
      originalName: originalName.slice(0, 255),
      size: p.variants[0].data.length,
      width: p.width,
      height: p.height,
      variants: p.variants.filter((v) => v.name !== 'orig').map((v) => Number(v.name)),
      checksum: createHash('sha256').update(p.variants[0].data).digest('hex'),
      storage: storageDriver(),
      version: sql`${media.version} + 1`,
    })
    .where(eq(media.id, id));
}

/** Reads the best variant for a requested width. */
export async function readMedia(key: string, width?: number) {
  if (!isValidKey(key)) return null;
  const [row] = await db.select().from(media).where(eq(media.storageKey, key)).limit(1);
  if (!row) return null;
  let variant = 'orig';
  if (width && row.kind === 'image') {
    const fit = [...(row.variants ?? [])].sort((a, b) => a - b).find((w) => w >= width);
    if (fit) variant = String(fit);
  }
  let data: Buffer;
  if (row.storage === 'filesystem') {
    try {
      data = await readFile(path.join(mediaRoot(), key, variant));
    } catch {
      return null;
    }
  } else {
    const [blob] = await db
      .select({ data: mediaBlobs.data })
      .from(mediaBlobs)
      .where(and(eq(mediaBlobs.mediaId, row.id), eq(mediaBlobs.variant, variant)))
      .limit(1);
    if (!blob) return null;
    data = Buffer.from(blob.data);
  }
  return { data, mime: row.mime, etag: `"${row.checksum.slice(0, 16)}-${variant}-v${row.version}"`, kind: row.kind, name: row.originalName };
}

/** Where a media file is used (scans every content column for its URL). */
export async function mediaUsage(key: string): Promise<string[]> {
  const needle = `%/media/${key}%`;
  const where: string[] = [];
  const q = async (label: string, query: Promise<unknown[]>) => {
    const rows = (await query) as { label: string }[];
    for (const r of rows) where.push(`${label}: ${r.label}`);
  };
  const like = (col: unknown) => sql`CAST(${col} AS CHAR) LIKE ${needle}`;
  const { pages, products, subBrands, articles, settings } = await import('@/lib/db/schema');
  await q('Halaman', db.select({ label: pages.title }).from(pages).where(sql`${like(pages.draft)} OR ${like(pages.published)}`));
  await q('Produk', db.select({ label: products.name }).from(products).where(sql`${like(products.image)} OR ${like(products.gallery)} OR ${like(products.seo)}`));
  await q('Sub-brand', db.select({ label: subBrands.name }).from(subBrands).where(sql`${like(subBrands.heroImage)} OR ${like(subBrands.extraSections)} OR ${like(subBrands.seo)}`));
  await q('Artikel', db.select({ label: articles.title }).from(articles).where(sql`${like(articles.bodyHtml)} OR ${like(articles.featuredImage)} OR ${like(articles.published)} OR ${like(articles.seo)}`));
  await q('Pengaturan', db.select({ label: settings.key }).from(settings).where(sql`${like(settings.draft)} OR ${like(settings.published)}`));
  return [...new Set(where)];
}

export async function deleteMedia(id: number): Promise<void> {
  const [row] = await db.select().from(media).where(eq(media.id, id));
  if (!row) return;
  await db.delete(media).where(eq(media.id, id)); // blobs cascade
  if (row.storage === 'filesystem') await rm(path.join(mediaRoot(), row.storageKey), { recursive: true, force: true });
}

export const mediaUrl = (key: string) => `/media/${key}`;
