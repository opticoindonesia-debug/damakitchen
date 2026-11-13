'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { createArticle, deleteArticle, saveArticleCategories } from '@/app/admin/actions/articles';
import { Button, Card, EmptyState, Field, Input, NoticeBar, StatusBadge, confirmAction, useAction } from '@/components/admin/ui';

export function ArticlesList({ rows: initial, categories: initialCats }: { rows: { id: number; title: string; slug: string; status: string; hasChanges: boolean; publishedAt: string | null; category: string | null }[]; categories: { id: number; name: string; slug: string; description: string }[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [cats, setCats] = useState(initialCats);
  const [title, setTitle] = useState('');
  const { busy, notice, setNotice, run } = useAction();
  return (
    <div className="space-y-6">
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      <Card title="Tulis artikel baru">
        <form className="flex flex-wrap items-end gap-3" onSubmit={async (e) => {
          e.preventDefault();
          const res = await run('new', () => createArticle({ title }));
          if (res.ok) router.push(`/admin/articles/${(res.data as { id: number }).id}`);
        }}>
          <Field label="Judul" htmlFor="new-article" className="min-w-[260px] flex-1">
            <Input id="new-article" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Rahasia rendang yang dimasak 6 jam" required />
          </Field>
          <Button type="submit" variant="primary" busy={busy === 'new'}>+ Buat artikel</Button>
        </form>
      </Card>
      <Card>
        {rows.length === 0 ? (
          <EmptyState>Belum ada artikel. Tulis yang pertama di atas.</EmptyState>
        ) : (
          <ul className="divide-y divide-stone-100">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/articles/${r.id}`} className="font-medium hover:underline">{r.title}</Link>
                  <p className="text-xs text-stone-500">
                    {r.category ?? 'Tanpa kategori'} · {r.publishedAt ? new Date(r.publishedAt).toLocaleDateString('id-ID') : '—'}
                  </p>
                </div>
                <StatusBadge status={r.status} hasChanges={r.status === 'published' && r.hasChanges} />
                <Link href={`/admin/articles/${r.id}`} className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50">Ubah</Link>
                <Button size="sm" variant="danger" onClick={async () => {
                  if (!confirmAction(`Hapus artikel "${r.title}" secara permanen?`)) return;
                  const res = await run('del', () => deleteArticle(r.id));
                  if (res.ok) setRows((x) => x.filter((y) => y.id !== r.id));
                }}>Hapus</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Kategori artikel">
        <ul className="space-y-2">
          {cats.map((c, i) => (
            <li key={c.id || `n${i}`} className="flex gap-2">
              <Input value={c.name} onChange={(e) => setCats(cats.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} aria-label={`Kategori ${i + 1}`} placeholder="Nama kategori" />
              <Input value={c.slug} onChange={(e) => setCats(cats.map((x, j) => (j === i ? { ...x, slug: e.target.value } : x)))} className="max-w-[200px]" placeholder="slug otomatis" aria-label={`Slug kategori ${i + 1}`} />
              <Button size="sm" variant="ghost" onClick={() => confirmAction(`Hapus kategori "${c.name}"?`) && setCats(cats.filter((_, j) => j !== i))} aria-label="Hapus kategori"><Trash2 size={14} /></Button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => setCats([...cats, { id: 0, name: '', slug: '', description: '' }])}><Plus size={14} /> Tambah kategori</Button>
          <Button size="sm" variant="primary" busy={busy === 'cats'} onClick={async () => {
            const res = await run('cats', () => saveArticleCategories(cats.map((c) => ({ ...c, id: c.id || undefined }))));
            if (res.ok && res.data) setCats(res.data as typeof cats);
          }}>Simpan kategori</Button>
        </div>
      </Card>
    </div>
  );
}
