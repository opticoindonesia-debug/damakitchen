import { notFound } from 'next/navigation';
import { asc, eq, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { articleCategories, articleTags, articles, products, tags } from '@/lib/db/schema';
import { ArticleEditor } from './ArticleEditor';

export default async function EditArticle({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const [a] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!a) notFound();
  const [cats, tagRows, others, allTags, prods] = await Promise.all([
    db.select({ id: articleCategories.id, name: articleCategories.name }).from(articleCategories).orderBy(asc(articleCategories.sortOrder)),
    db.select({ name: tags.name }).from(articleTags).innerJoin(tags, eq(tags.id, articleTags.tagId)).where(eq(articleTags.articleId, id)),
    db.select({ id: articles.id, title: articles.title }).from(articles).where(ne(articles.id, id)),
    db.select({ name: tags.name }).from(tags),
    db.select({ slug: products.slug, name: products.name }).from(products).orderBy(asc(products.sortOrder)),
  ]);
  return (
    <ArticleEditor
      id={a.id}
      status={a.status}
      hasChanges={a.hasChanges}
      categories={cats}
      others={others}
      tagSuggestions={allTags.map((t) => t.name)}
      products={prods}
      initial={{
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt ?? '',
        bodyHtml: a.bodyHtml,
        featuredImage: a.featuredImage ?? undefined,
        author: a.author ?? '',
        categoryId: a.categoryId,
        publishedAt: (a.publishedAt ?? new Date()).toISOString().slice(0, 10),
        tags: tagRows.map((t) => t.name),
        relatedIds: a.relatedIds ?? [],
        shortAnswer: a.shortAnswer ?? '',
        sources: a.sources ?? [],
        relatedProducts: a.relatedProducts ?? [],
        seo: a.seo ?? {},
      }}
    />
  );
}
