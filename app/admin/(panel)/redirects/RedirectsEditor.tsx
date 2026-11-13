'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteRedirect, saveRedirect } from '@/app/admin/actions/misc';
import { Button, Card, EmptyState, Field, Input, NoticeBar, Select, confirmAction, useAction } from '@/components/admin/ui';

type Row = { id: number; fromPath: string; toPath: string; statusCode: number; note: string };

export function RedirectsEditor({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ fromPath: '', toPath: '', statusCode: 301, note: '' });
  const { busy, notice, setNotice, run } = useAction();
  return (
    <div className="space-y-5">
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      <Card title="Tambah pengalihan">
        <form className="grid gap-3 sm:grid-cols-[1fr_1fr_160px_auto] sm:items-end" onSubmit={async (e) => {
          e.preventDefault();
          const res = await run('add', () => saveRedirect(null, form));
          if (res.ok) { setForm({ fromPath: '', toPath: '', statusCode: 301, note: '' }); router.refresh(); }
        }}>
          <Field label="Dari alamat lama" htmlFor="r-from"><Input id="r-from" value={form.fromPath} onChange={(e) => setForm({ ...form, fromPath: e.target.value })} placeholder="/menu-lama" required /></Field>
          <Field label="Ke alamat baru" htmlFor="r-to"><Input id="r-to" value={form.toPath} onChange={(e) => setForm({ ...form, toPath: e.target.value })} placeholder="/menu" required /></Field>
          <Field label="Jenis" htmlFor="r-code">
            <Select id="r-code" value={form.statusCode} onChange={(e) => setForm({ ...form, statusCode: Number(e.target.value) })}>
              <option value={301}>Permanen (301)</option>
              <option value={302}>Sementara (302)</option>
            </Select>
          </Field>
          <Button type="submit" variant="primary" busy={busy === 'add'}>Tambah</Button>
        </form>
      </Card>
      <Card>
        {rows.length === 0 ? <EmptyState>Belum ada pengalihan.</EmptyState> : (
          <ul className="divide-y divide-stone-100 text-sm">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <code className="rounded bg-stone-100 px-1.5">{r.fromPath}</code>→<code className="rounded bg-stone-100 px-1.5">{r.toPath}</code>
                <span className="text-xs text-stone-500">{r.statusCode}{r.note ? ` · ${r.note}` : ''}</span>
                <Button size="sm" variant="danger" className="ml-auto" onClick={async () => {
                  if (!confirmAction(`Hapus pengalihan ${r.fromPath}?`)) return;
                  const res = await run('del', () => deleteRedirect(r.id));
                  if (res.ok) router.refresh();
                }}>Hapus</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
