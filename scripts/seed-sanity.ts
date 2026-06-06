/**
 * Seed Sanity with the current placeholder content from /content.
 *
 * Idempotent: uses deterministic _id's + createOrReplace, so you can run it
 * again safely after editing the static files. It does NOT touch documents you
 * create later in the Studio (different ids).
 *
 * Usage:
 *   1. Create a write token at sanity.io/manage → API → Tokens (Editor role).
 *   2. Put these in .env.local (or export them in your shell):
 *        NEXT_PUBLIC_SANITY_PROJECT_ID=...
 *        NEXT_PUBLIC_SANITY_DATASET=production
 *        SANITY_API_WRITE_TOKEN=...
 *   3. Run:  pnpm seed:sanity
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@sanity/client';

import { subBrandList } from '../content/subbrands';
import { products } from '../content/products';
import { pillars } from '../content/pillars';
import { values } from '../content/values';
import { testimonials } from '../content/testimonials';
import { site, seasonal } from '../content/site';
import { WHATSAPP_NUMBER, contact, channels } from '../content/channels';

// ── minimal .env.local loader (no extra deps) ─────────────────
function loadEnvLocal() {
  try {
    const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    // no .env.local — rely on shell env
  }
}
loadEnvLocal();

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN || '';

if (!projectId || !token) {
  console.error(
    '\n✗ Missing config. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN' +
      ' (in .env.local or your shell) before running.\n',
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01',
  token,
  useCdn: false,
});

// Deterministic key for array-of-object members (Sanity requires _key).
const key = (prefix: string, i: number) => `${prefix}-${i}`;

type Doc = Record<string, unknown> & { _id: string; _type: string };

function buildDocs(): Doc[] {
  const docs: Doc[] = [];

  // Site settings (singleton)
  docs.push({
    _id: 'siteSettings',
    _type: 'siteSettings',
    tagline: site.tagline,
    hashtag: site.hashtag,
    brandLineEn: site.brandLineEn,
    umbrellaPromise: site.umbrellaPromise,
    rootProverb: site.rootProverb,
    whatsappNumber: WHATSAPP_NUMBER,
    email: contact.email,
    instagram: contact.instagram.href,
    tiktok: contact.tiktok.href,
    threads: contact.threads.href,
    coverage: contact.coverage,
    shopeeUrl: channels.shopee.href,
    tiktokShopUrl: channels.tiktok.href,
    gofoodUrl: channels.gofood.href,
    grabUrl: channels.grab.href,
    seasonalActive: seasonal.active,
    seasonalLabel: seasonal.label,
    seasonalMessage: seasonal.message,
  });

  // Sub-brands
  subBrandList.forEach((sb, idx) => {
    docs.push({
      _id: `subBrand.${sb.slug}`,
      _type: 'subBrand',
      name: sb.name,
      slug: sb.slug,
      shortName: sb.shortName,
      emotion: sb.emotion,
      lead: sb.lead,
      about: sb.about,
      howToOrder: sb.howToOrder,
      channels: sb.channels,
      faqs: sb.faqs.map((f, i) => ({ _type: 'faq', _key: key('faq', i), q: f.q, a: f.a })),
      crossSell: sb.crossSell,
      order: idx,
    });
  });

  // Products
  products.forEach((p, idx) => {
    const doc: Doc = {
      _id: `product.${p.id}`,
      _type: 'product',
      name: p.name,
      slug: { _type: 'slug', current: p.id },
      blurb: p.blurb,
      subBrand: { _type: 'reference', _ref: `subBrand.${p.subBrand}` },
      info: p.info,
      imageCategory: p.imageCategory,
      order: idx,
    };
    if (typeof p.price === 'number') doc.price = p.price;
    docs.push(doc);
  });

  // Pillars
  pillars.forEach((p, i) => {
    docs.push({ _id: `pillar.${i}`, _type: 'pillar', title: p.title, desc: p.desc, icon: p.icon, order: i });
  });

  // Values
  values.forEach((v, i) => {
    docs.push({ _id: `brandValue.${i}`, _type: 'brandValue', title: v.title, desc: v.desc, order: i });
  });

  // Testimonials
  testimonials.forEach((t, i) => {
    docs.push({
      _id: `testimonial.${i}`,
      _type: 'testimonial',
      name: t.name,
      context: t.context,
      quote: t.quote,
      order: i,
    });
  });

  return docs;
}

async function main() {
  const docs = buildDocs();
  console.log(`Seeding ${docs.length} documents to ${projectId}/${dataset}…`);

  const tx = client.transaction();
  for (const doc of docs) tx.createOrReplace(doc);
  await tx.commit();

  const counts = docs.reduce<Record<string, number>>((acc, d) => {
    acc[d._type] = (acc[d._type] ?? 0) + 1;
    return acc;
  }, {});
  console.log('✓ Done:', counts);
  console.log('Open /studio to edit. (Re-run anytime — it overwrites only these seeded docs.)');
}

main().catch((err: unknown) => {
  console.error('✗ Seeding failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
