import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { formContext } from '@/lib/admin/context';
import { BUILT_IN_PAGES, type BuiltInPageKey } from '@/lib/pages';
import { PageEditor } from './PageEditor';

export default async function EditPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const [row] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
  if (!row) notFound();
  const ctx = await formContext();
  const draft = row.draft as { title: string; slug: string; sections: Record<string, unknown>[]; seo: Record<string, unknown> };
  const path = row.builtinKey ? BUILT_IN_PAGES[row.builtinKey as BuiltInPageKey].path : `/${draft.slug}`;
  return (
    <PageEditor
      id={row.id}
      builtIn={Boolean(row.builtinKey)}
      path={path}
      initial={{ title: draft.title, slug: draft.slug, sections: (draft.sections ?? []) as never, seo: (draft.seo ?? {}) as never }}
      status={row.status}
      hasChanges={row.hasChanges}
      ctx={ctx}
    />
  );
}
