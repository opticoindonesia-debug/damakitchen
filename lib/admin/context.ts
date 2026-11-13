import 'server-only';
import { asc, isNotNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { articles, pages, products, subBrands } from '@/lib/db/schema';

/** Options the admin forms need: sub-brand list and internal link suggestions. */
export async function formContext() {
  const [sbs, pg, prods, arts] = await Promise.all([
    db.select({ slug: subBrands.slug, name: subBrands.name }).from(subBrands).orderBy(asc(subBrands.sortOrder)),
    db.select({ slug: pages.publishedSlug }).from(pages).where(isNotNull(pages.publishedSlug)),
    db.select({ slug: products.slug }).from(products),
    db.select({ slug: articles.publishedSlug }).from(articles).where(isNotNull(articles.publishedSlug)),
  ]);
  const links = new Set<string>(['/', '/pesan', '/menu', '/kontak', '/katering', '/hadiah', '/cerita', '/catatan-dapur']);
  pg.forEach((p) => links.add(`/${p.slug ?? ''}`));
  sbs.forEach((s) => links.add(`/${s.slug}`));
  prods.forEach((p) => links.add(`/menu/${p.slug}`));
  arts.forEach((a) => links.add(`/catatan-dapur/${a.slug}`));
  return {
    subBrandOptions: sbs.map((s) => ({ value: s.slug, label: s.name })),
    linkSuggestions: [...links].sort(),
  };
}
