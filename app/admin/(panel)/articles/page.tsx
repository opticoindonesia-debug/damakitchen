import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { articleCategories, articles } from '@/lib/db/schema';
import { PageHeader } from '@/components/admin/ui';
import { ArticlesList } from './ArticlesList';

export default async function ArticlesIndex() {
  const [rows, cats] = await Promise.all([
    db
      .select({ id: articles.id, title: articles.title, slug: articles.slug, status: articles.status, hasChanges: articles.hasChanges, publishedAt: articles.publishedAt, category: articleCategories.name })
      .from(articles)
      .leftJoin(articleCategories, eq(articleCategories.id, articles.categoryId))
      .orderBy(desc(articles.updatedAt)),
    db.select().from(articleCategories).orderBy(asc(articleCategories.sortOrder)),
  ]);
  return (
    <>
      <PageHeader title="Catatan Dapur" description="Artikel cerita, resep dan kabar dari dapur DAMA. Ditulis seperti dokumen biasa; tampil di /catatan-dapur." />
      <ArticlesList
        rows={rows.map((r) => ({ ...r, publishedAt: r.publishedAt?.toISOString() ?? null }))}
        categories={cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? '' }))}
      />
    </>
  );
}
