/**
 * Shared seed data: turns the static /content placeholders into Sanity docs.
 * Used by both the CLI script (scripts/seed-sanity.ts) and the in-Studio
 * "Impor Konten Awal" button (sanity/SeedTool.tsx) so there's one source.
 */
import { subBrandList } from '../content/subbrands';
import { products } from '../content/products';
import { pillars } from '../content/pillars';
import { values } from '../content/values';
import { testimonials } from '../content/testimonials';
import { site, seasonal } from '../content/site';
import { WHATSAPP_NUMBER, contact, channels } from '../content/channels';
import { founder } from '../content/story';

export type SeedDoc = Record<string, unknown> & { _id: string; _type: string };

const key = (prefix: string, i: number) => `${prefix}-${i}`;

export function buildSeedDocs(): SeedDoc[] {
  const docs: SeedDoc[] = [];

  docs.push({
    _id: 'siteSettings',
    _type: 'siteSettings',
    tagline: site.tagline,
    hashtag: site.hashtag,
    brandLineEn: site.brandLineEn,
    umbrellaPromise: site.umbrellaPromise,
    rootProverb: site.rootProverb,
    heroHeadline: `${site.tagline}.`,
    essence: 'Masakan bukan sekadar makanan — ia sarana merawat hubungan.',
    founderQuote: founder.pullQuote,
    founderName: founder.name,
    founderRole: founder.role,
    heroStyle: 'cream',
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

  products.forEach((p, idx) => {
    const doc: SeedDoc = {
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

  pillars.forEach((p, i) => {
    docs.push({ _id: `pillar.${i}`, _type: 'pillar', title: p.title, desc: p.desc, icon: p.icon, order: i });
  });

  values.forEach((v, i) => {
    docs.push({ _id: `brandValue.${i}`, _type: 'brandValue', title: v.title, desc: v.desc, order: i });
  });

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
