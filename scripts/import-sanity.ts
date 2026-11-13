/**
 * Imports a Sanity dataset export (the content the owner edited in the old
 * Studio) into the new MySQL CMS. Needs NO Sanity packages or account access.
 *
 * 1. Old project owner runs (anywhere with the Sanity CLI, or Studio → … → Export):
 *      npx sanity dataset export production sanity-export.tar.gz
 * 2. Then, against the target database:
 *      DATABASE_URL=mysql://… pnpm import:sanity sanity-export.tar.gz            (dry run: report only)
 *      DATABASE_URL=mysql://… pnpm import:sanity sanity-export.tar.gz --apply    (write)
 *
 * Safe by design: never deletes anything. Matching records (by slug / page key)
 * are UPDATED as working copies; pages & articles become drafts with changes
 * ("Ada perubahan belum terbit") so the owner reviews them and clicks Publish.
 * Writes a Markdown report next to the export file.
 */
import { readFileSync, existsSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { eq } from 'drizzle-orm';
import { ensureReady } from '../lib/bootstrap';
import { db, getPool } from '../lib/db';
import { articles, brandItems, pages, products, settings, subBrands, testimonials } from '../lib/db/schema';
import { saveUpload } from '../lib/media';
import { portableTextToHtml } from '../lib/portableText';
import { validateSections } from '../lib/sections/validate';
import { cleanNavigation, cleanSiteSettings, cleanTheme, DEFAULT_NAVIGATION, DEFAULT_SITE, DEFAULT_THEME } from '../lib/settings';
import { sanitizeRichText } from '../lib/sanitize';
import { slugify } from '../lib/text';
import { BUILT_IN_PAGES } from '../lib/pages';

type Doc = Record<string, unknown> & { _id: string; _type: string };

// ── Read export (.tar.gz or extracted folder) ─────────────────
function readTar(buf: Buffer): Map<string, Buffer> {
  const files = new Map<string, Buffer>();
  let off = 0;
  while (off + 512 <= buf.length) {
    const header = buf.subarray(off, off + 512);
    const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    if (!name) break;
    const prefix = header.subarray(345, 500).toString('utf8').replace(/\0.*$/, '');
    const size = parseInt(header.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim() || '0', 8);
    const type = header[156];
    const full = prefix ? `${prefix}/${name}` : name;
    if (type === 48 || type === 0) files.set(full, buf.subarray(off + 512, off + 512 + size));
    off += 512 + Math.ceil(size / 512) * 512;
  }
  return files;
}

function loadExport(p: string): { docs: Doc[]; file: (rel: string) => Buffer | undefined } {
  if (statSync(p).isDirectory()) {
    const ndjson = existsSync(path.join(p, 'data.ndjson')) ? path.join(p, 'data.ndjson') : path.join(p, readdirSync(p)[0], 'data.ndjson');
    const root = path.dirname(ndjson);
    return {
      docs: readFileSync(ndjson, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)),
      file: (rel) => (existsSync(path.join(root, rel)) ? readFileSync(path.join(root, rel)) : undefined),
    };
  }
  const files = readTar(gunzipSync(readFileSync(p)));
  const ndKey = [...files.keys()].find((k) => k.endsWith('data.ndjson'));
  if (!ndKey) throw new Error('data.ndjson not found in export');
  const root = ndKey.slice(0, -'data.ndjson'.length);
  return {
    docs: files.get(ndKey)!.toString('utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)),
    file: (rel) => files.get(root + rel.replace(/^\.\//, '')),
  };
}

// ── Report ────────────────────────────────────────────────────
const report = { migrated: [] as string[], review: [] as string[], failed: [] as string[], assets: [] as string[] };

async function main() {
  const [exportPath, ...flags] = process.argv.slice(2);
  const apply = flags.includes('--apply');
  if (!exportPath) throw new Error('Usage: pnpm import:sanity <export.tar.gz|folder> [--apply]');
  await ensureReady();
  const { docs: all, file } = loadExport(exportPath);
  const docs = all.filter((d) => !d._id.startsWith('drafts.') && !d._type.startsWith('sanity.') && !d._type.startsWith('system.'));
  const drafts = all.filter((d) => d._id.startsWith('drafts.'));
  if (drafts.length) report.review.push(`${drafts.length} unpublished Sanity draft(s) were NOT imported (only published content is imported): ${drafts.map((d) => d._id).join(', ')}`);
  const byId = new Map(all.map((d) => [d._id, d]));

  // Images: upload each referenced asset once.
  const uploaded = new Map<string, string>();
  async function image(v: unknown, label: string): Promise<{ url: string; alt?: string } | undefined> {
    if (!v || typeof v !== 'object') return undefined;
    const o = v as Record<string, unknown>;
    let rel: string | undefined;
    if (typeof o._sanityAsset === 'string') rel = o._sanityAsset.replace(/^image@file:\/\/\.?\/?/, '');
    else if (o.asset && typeof (o.asset as Record<string, unknown>)._ref === 'string') {
      const ref = (o.asset as { _ref: string })._ref; // image-<hash>-<WxH>-<ext>
      const m = /^image-([a-f0-9]+-\d+x\d+)-(\w+)$/.exec(ref);
      if (m) rel = `images/${m[1]}.${m[2]}`;
    }
    if (!rel) return undefined;
    if (uploaded.has(rel)) return { url: uploaded.get(rel)!, alt: (o.alt as string) || undefined };
    const buf = file(rel);
    if (!buf) {
      report.assets.push(`${label}: image file ${rel} missing from export — re-upload in Admin → Media`);
      return undefined;
    }
    if (!apply) {
      uploaded.set(rel, `/media/(dry-run)/${rel}`);
      return { url: uploaded.get(rel)!, alt: (o.alt as string) || undefined };
    }
    try {
      const row = await saveUpload({ buffer: buf, originalName: path.basename(rel), folder: 'sanity-import', alt: (o.alt as string) || '' });
      uploaded.set(rel, `/media/${row.storageKey}`);
      return { url: `/media/${row.storageKey}`, alt: (o.alt as string) || undefined };
    } catch (err) {
      report.assets.push(`${label}: ${rel} could not be processed (${(err as Error).message})`);
      return undefined;
    }
  }

  /** Deep-converts Sanity section data: images → {url,alt}, Portable Text bodies → HTML. */
  async function convertSections(list: unknown, label: string): Promise<Record<string, unknown>[]> {
    if (!Array.isArray(list)) return [];
    const walk = async (v: unknown): Promise<unknown> => {
      if (Array.isArray(v)) {
        if (v.length && (v[0] as Record<string, unknown>)?._type === 'block') return portableTextToHtml(v);
        return Promise.all(v.map(walk));
      }
      if (v && typeof v === 'object') {
        const o = v as Record<string, unknown>;
        if (o._type === 'image' || o._sanityAsset || o.asset) {
          const img = await image(o, label);
          return img ? { ...img, ...(o.caption ? { caption: o.caption } : {}), ...(o._key ? { _key: o._key } : {}) } : undefined;
        }
        const out: Record<string, unknown> = {};
        for (const [k, val] of Object.entries(o)) out[k] = await walk(val);
        return out;
      }
      return v;
    };
    const converted = (await walk(list)) as unknown[];
    const { sections, problems } = validateSections(converted, label);
    problems.forEach((p) => report.review.push(p));
    return sections;
  }

  const ofType = (t: string) => docs.filter((d) => d._type === t);
  const str = (v: unknown) => (typeof v === 'string' ? v : '');

  // ── Site settings → site / theme / navigation (as drafts) ──
  const s = docs.find((d) => d._id === 'siteSettings');
  if (s) {
    const site = cleanSiteSettings({
      ...DEFAULT_SITE,
      tagline: s.tagline,
      hashtag: s.hashtag,
      brandLineEn: s.brandLineEn,
      description: s.umbrellaPromise,
      heroHeadline: s.heroHeadline,
      essence: s.essence,
      founderQuote: s.founderQuote,
      founderName: s.founderName,
      founderRole: s.founderRole,
      whatsappNumber: s.whatsappNumber ?? DEFAULT_SITE.whatsappNumber,
      email: s.email,
      instagram: s.instagram,
      tiktok: s.tiktok,
      threads: s.threads,
      serviceArea: s.coverage,
      backgroundMotif: s.backgroundMotif,
      motifOpacity: s.motifOpacity,
      logo: await image(s.logo, 'Logo'),
      logoLight: await image(s.logoLight, 'Logo terang'),
      monogram: await image(s.monogram, 'Monogram'),
      seasonal: { active: s.seasonalActive === true, label: s.seasonalLabel ?? DEFAULT_SITE.seasonal.label, message: s.seasonalMessage ?? DEFAULT_SITE.seasonal.message },
      subBrandLabels: { ...DEFAULT_SITE.subBrandLabels, ...((s.subBrandLabels as object) ?? {}) },
      channels: {
        ...DEFAULT_SITE.channels,
        shopee: { ...DEFAULT_SITE.channels.shopee, url: str(s.shopeeUrl) || DEFAULT_SITE.channels.shopee.url },
        tiktok: { ...DEFAULT_SITE.channels.tiktok, url: str(s.tiktokShopUrl) || DEFAULT_SITE.channels.tiktok.url },
        gofood: { ...DEFAULT_SITE.channels.gofood, url: str(s.gofoodUrl) || DEFAULT_SITE.channels.gofood.url },
        grab: { ...DEFAULT_SITE.channels.grab, url: str(s.grabUrl) || DEFAULT_SITE.channels.grab.url },
      },
    });
    site.problems.forEach((p) => report.review.push(`Site settings: ${p}`));
    const hex = (c: unknown) => (c && typeof c === 'object' ? (c as { hex?: string }).hex : undefined);
    const theme = cleanTheme({
      ...DEFAULT_THEME,
      colors: {
        ...DEFAULT_THEME.colors,
        ...Object.fromEntries(
          Object.entries({ primary: s.colorPrimary, accent: s.colorAccent, highlight: s.colorHighlight, background: s.colorBackground, text: s.colorText, soft: s.colorSoft, festive: s.colorFestive })
            .map(([k, v]) => [k, hex(v)])
            .filter(([, v]) => v),
        ),
      },
    });
    const navItems = Array.isArray(s.navItems)
      ? (s.navItems as Record<string, unknown>[]).map((it) => (it._type === 'navSubBrands' ? { kind: 'subBrands', label: it.label || 'Sub-brand' } : { kind: 'link', label: it.label, href: it.link }))
      : DEFAULT_NAVIGATION.items;
    const nav = cleanNavigation({
      items: navItems,
      cta: { label: s.navCtaLabel ?? DEFAULT_NAVIGATION.cta.label, href: s.navCtaLink ?? DEFAULT_NAVIGATION.cta.href, show: true },
      footer: {
        ...DEFAULT_NAVIGATION.footer,
        colSubBrand: s.footerColSubBrand ?? DEFAULT_NAVIGATION.footer.colSubBrand,
        colExplore: s.footerColExplore ?? DEFAULT_NAVIGATION.footer.colExplore,
        colContact: s.footerColContact ?? DEFAULT_NAVIGATION.footer.colContact,
        exploreLinks: Array.isArray(s.footerLinks) ? (s.footerLinks as { label: string; link: string }[]).map((l) => ({ label: l.label, href: l.link })) : DEFAULT_NAVIGATION.footer.exploreLinks,
        note: s.footerNote ?? DEFAULT_NAVIGATION.footer.note,
      },
    });
    nav.problems.forEach((p) => report.review.push(`Navigation: ${p}`));
    if (apply) {
      for (const [key, data] of [['site', site.data], ['theme', theme], ['navigation', nav.data]] as const) {
        await db.update(settings).set({ draft: data as never, hasChanges: true }).where(eq(settings.key, key));
      }
    }
    report.migrated.push('Site settings, theme colors, navigation & footer → saved as DRAFTS (review in Admin, then Terbitkan)');
    if (s.heroImage || s.founderImage) report.review.push('Legacy Beranda hero/founder photos found in siteSettings — check the Beranda page sections use them.');
  }

  // ── Sub-brands (update by slug; never delete) ──
  for (const d of ofType('subBrand')) {
    const slug = str(d.slug) || str((d.slug as { current?: string })?.current);
    if (!slug) { report.failed.push(`subBrand ${d._id}: no slug`); continue; }
    const hero = await image(d.heroImage, `Sub-brand ${slug}`);
    const extra = await convertSections(d.extraSections, `Sub-brand ${slug} extra`);
    const patch: Record<string, unknown> = {
      ...(d.name ? { name: d.name } : {}),
      ...(d.shortName ? { shortName: d.shortName } : {}),
      ...(d.emotion ? { emotion: d.emotion } : {}),
      ...(d.lead ? { lead: d.lead } : {}),
      ...(d.about ? { about: d.about } : {}),
      ...(d.howToOrder ? { howToOrder: d.howToOrder } : {}),
      ...(d.channelNote ? { channelNote: d.channelNote } : {}),
      ...(Array.isArray(d.channels) ? { channels: d.channels } : {}),
      ...(Array.isArray(d.faqs) ? { faqs: (d.faqs as { q: string; a: string }[]).map(({ q, a }) => ({ q, a })) } : {}),
      ...(Array.isArray(d.crossSell) ? { crossSell: d.crossSell } : {}),
      ...((d.markerColor as { hex?: string })?.hex ? { markerHex: (d.markerColor as { hex: string }).hex.slice(0, 7).toUpperCase() } : {}),
      ...(hero ? { heroImage: hero } : {}),
      ...(extra.length ? { extraSections: extra } : {}),
    };
    const [existing] = await db.select({ id: subBrands.id }).from(subBrands).where(eq(subBrands.slug, slug)).limit(1);
    if (!existing) { report.review.push(`Sub-brand "${slug}" exists in Sanity but not in the new CMS — create it in Admin → Sub-brand if still needed.`); continue; }
    if (apply) await db.update(subBrands).set(patch).where(eq(subBrands.id, existing.id));
    report.migrated.push(`Sub-brand ${slug} (${Object.keys(patch).length} fields)`);
  }

  // ── Products (update or insert by slug) ──
  const sbRows = await db.select({ id: subBrands.id, slug: subBrands.slug }).from(subBrands);
  for (const d of ofType('product')) {
    const slug = slugify(str((d.slug as { current?: string })?.current) || str(d.name) || d._id);
    const ref = (d.subBrand as { _ref?: string })?._ref;
    const sbSlug = ref ? str(byId.get(ref)?.slug) : '';
    const img = await image(d.image, `Product ${slug}`);
    const data = {
      name: str(d.name) || slug,
      blurb: str(d.blurb),
      subBrandId: sbRows.find((r) => r.slug === sbSlug)?.id ?? null,
      info: Array.isArray(d.info) ? (d.info as string[]) : [],
      price: typeof d.price === 'number' ? Math.round(d.price) : null,
      imageCategory: str(d.imageCategory) || 'food',
      ...(img ? { image: img } : {}),
    };
    const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
    if (apply) {
      if (existing) await db.update(products).set(data).where(eq(products.id, existing.id));
      else await db.insert(products).values({ ...data, slug, gallery: [], orderLinks: [], seo: {}, status: 'published', sortOrder: Number(d.order ?? 999) });
    }
    report.migrated.push(`Product ${slug} (${existing ? 'updated' : 'new'})${typeof d.price === 'number' ? ` price ${d.price}` : ''}`);
  }

  // ── Pages (built-in by id, custom by slug) → drafts ──
  for (const d of ofType('page')) {
    const key = d._id.startsWith('page-') ? d._id.slice(5) : null;
    const builtIn = key && key in BUILT_IN_PAGES ? key : null;
    const label = `Page ${builtIn ?? str((d.slug as { current?: string })?.current) ?? d._id}`;
    let sections = await convertSections(d.sections, label);
    if (!sections.length && (d.body || d.intro)) {
      // Legacy single-block page → one Teks section.
      const hero = await image(d.heroImage, label);
      sections = (await convertSections([{ _type: 'textSection', _key: 'legacy', eyebrow: d.eyebrow, heading: d.title, body: portableTextToHtml(d.body) }], label)).concat(
        hero ? (await convertSections([{ _type: 'gallerySection', _key: 'legacy-img', images: [{ ...hero, _key: 'h' }], columns: '1' }], label)) : [],
      );
    }
    const seo = { title: str(d.seoTitle) || undefined, description: str(d.seoDescription) || undefined };
    if (builtIn) {
      const [row] = await db.select().from(pages).where(eq(pages.builtinKey, builtIn)).limit(1);
      if (!row) { report.failed.push(`${label}: built-in page missing`); continue; }
      const doc = { title: str(d.title) || row.title, slug: row.slug, sections, seo };
      if (apply) await db.update(pages).set({ draft: doc, title: doc.title, hasChanges: true }).where(eq(pages.id, row.id));
      report.migrated.push(`${label}: ${sections.length} sections → draft (review & publish)`);
    } else {
      const slug = slugify(str((d.slug as { current?: string })?.current) || str(d.title));
      if (!slug) { report.failed.push(`${label}: no slug`); continue; }
      const doc = { title: str(d.title) || slug, slug, sections, seo };
      const [row] = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
      if (apply) {
        if (row) await db.update(pages).set({ draft: doc, title: doc.title, hasChanges: true }).where(eq(pages.id, row.id));
        else await db.insert(pages).values({ title: doc.title, slug, draft: doc, status: 'draft', hasChanges: true, sortOrder: 100 });
      }
      report.migrated.push(`${label}: custom page (${sections.length} sections) → draft`);
    }
  }

  // ── Articles ──
  for (const d of ofType('journalPost')) {
    const slug = slugify(str((d.slug as { current?: string })?.current) || str(d.title));
    if (!slug) { report.failed.push(`journalPost ${d._id}: no slug`); continue; }
    const cover = await image(d.coverImage, `Article ${slug}`);
    const blocks = Array.isArray(d.body) ? d.body : [];
    const imgUrls = new Map<unknown, string>();
    for (const b of blocks as Record<string, unknown>[]) if (b?._type === 'image') { const r = await image(b, `Article ${slug} body`); if (r) imgUrls.set(b, r.url); }
    const bodyHtml = sanitizeRichText(portableTextToHtml(blocks, (b) => imgUrls.get(b)));
    const data = { title: str(d.title) || slug, slug, excerpt: str(d.excerpt) || null, bodyHtml, featuredImage: cover ?? null, publishedAt: d.publishedAt ? new Date(str(d.publishedAt)) : new Date() };
    const [row] = await db.select({ id: articles.id }).from(articles).where(eq(articles.slug, slug)).limit(1);
    if (apply) {
      if (row) await db.update(articles).set({ ...data, hasChanges: true }).where(eq(articles.id, row.id));
      else await db.insert(articles).values({ ...data, relatedIds: [], seo: {}, status: 'draft', hasChanges: true });
    }
    report.migrated.push(`Article ${slug} → draft (review & publish)`);
  }

  // ── Small collections (only replace when Sanity has entries) ──
  const t = ofType('testimonial');
  if (t.length) {
    if (apply) {
      await db.update(testimonials).set({ visible: false });
      await db.insert(testimonials).values(t.map((x, i) => ({ name: str(x.name), context: str(x.context), quote: str(x.quote), sortOrder: Number(x.order ?? i), visible: true })));
    }
    report.migrated.push(`${t.length} testimonials (previous ones hidden, not deleted)`);
  }
  for (const [type, kind] of [['pillar', 'pillar'], ['brandValue', 'value']] as const) {
    const list = ofType(type);
    if (!list.length) continue;
    if (apply) {
      await db.update(brandItems).set({ visible: false }).where(eq(brandItems.kind, kind));
      await db.insert(brandItems).values(list.map((x, i) => ({ kind, title: str(x.title), body: str(x.desc), icon: str(x.icon) || null, sortOrder: Number(x.order ?? i), visible: true })));
    }
    report.migrated.push(`${list.length} ${type} entries (previous ones hidden, not deleted)`);
  }

  const known = new Set(['siteSettings', 'subBrand', 'product', 'page', 'journalPost', 'testimonial', 'pillar', 'brandValue']);
  const unknown = [...new Set(docs.filter((d) => !known.has(d._type)).map((d) => d._type))];
  if (unknown.length) report.review.push(`Document types not imported (no equivalent): ${unknown.join(', ')}`);

  const md = [
    `# Sanity import report — ${new Date().toISOString()}`,
    `Mode: ${apply ? 'APPLIED' : 'DRY RUN (nothing written)'} · source: ${path.basename(exportPath)} · ${docs.length} published documents`,
    '', '## Migrated', ...report.migrated.map((x) => `- ${x}`),
    '', '## Needs manual verification', ...(report.review.length ? report.review.map((x) => `- ${x}`) : ['- none']),
    '', '## Failed', ...(report.failed.length ? report.failed.map((x) => `- ${x}`) : ['- none']),
    '', '## Assets needing replacement', ...(report.assets.length ? report.assets.map((x) => `- ${x}`) : ['- none']),
  ].join('\n');
  const out = `${exportPath.replace(/(\.tar\.gz|\/)?$/, '')}-import-report.md`;
  writeFileSync(out, md);
  console.log(md);
  console.log(`\nReport written to ${out}`);
  await getPool().end();
}

main().catch(async (err) => {
  console.error(err);
  await getPool().end().catch(() => undefined);
  process.exit(1);
});
