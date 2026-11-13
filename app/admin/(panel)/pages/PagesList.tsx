'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { createPage, deletePage, duplicatePage, reorderPages } from '@/app/admin/actions/pages';
import { Badge, Button, Card, Field, Input, NoticeBar, StatusBadge, confirmAction, useAction } from '@/components/admin/ui';

interface Row {
  id: number;
  title: string;
  slug: string;
  builtinKey: string | null;
  status: string;
  hasChanges: boolean;
  updatedAt: string;
}

export function PagesList({ rows: initial }: { rows: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [title, setTitle] = useState('');
  const { busy, notice, setNotice, run } = useAction();

  const move = async (i: number, d: number) => {
    const next = [...rows];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    setRows(next);
    await run('order', () => reorderPages(next.map((r) => r.id)));
  };

  return (
    <div className="space-y-6">
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      <Card title="Buat halaman baru">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await run('create', () => createPage({ title }));
            if (res.ok) router.push(`/admin/pages/${(res.data as { id: number }).id}`);
          }}
        >
          <Field label="Judul halaman" htmlFor="new-page" className="min-w-[260px] flex-1">
            <Input id="new-page" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Paket Ramadan" required />
          </Field>
          <Button type="submit" variant="primary" busy={busy === 'create'}>
            + Buat halaman
          </Button>
        </form>
      </Card>
      <Card>
        <ul className="divide-y divide-stone-100">
          {rows.map((r, i) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="flex flex-col">
                <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Naikkan ${r.title}`}><ArrowUp size={14} /></Button>
                <Button size="sm" variant="ghost" disabled={i === rows.length - 1} onClick={() => move(i, 1)} aria-label={`Turunkan ${r.title}`}><ArrowDown size={14} /></Button>
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/pages/${r.id}`} className="font-medium text-stone-900 hover:underline">
                  {r.title}
                </Link>
                <p className="text-xs text-stone-500">
                  /{r.slug} {r.builtinKey && <Badge>halaman utama</Badge>}
                </p>
              </div>
              <StatusBadge status={r.status} hasChanges={r.hasChanges} />
              <div className="flex gap-2">
                <Link href={`/admin/pages/${r.id}`} className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50">Ubah</Link>
                <Button
                  size="sm"
                  onClick={async () => {
                    const res = await run('dup', () => duplicatePage(r.id));
                    if (res.ok) router.push(`/admin/pages/${(res.data as { id: number }).id}`);
                  }}
                >
                  Gandakan
                </Button>
                {!r.builtinKey && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      if (!confirmAction(`Hapus halaman "${r.title}" secara permanen?`)) return;
                      const res = await run('del', () => deletePage(r.id));
                      if (res.ok) setRows((x) => x.filter((y) => y.id !== r.id));
                    }}
                  >
                    Hapus
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
