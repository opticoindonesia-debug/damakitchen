'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { reorderSubBrands } from '@/app/admin/actions/catalog';
import { Badge, Button, Card, NoticeBar, useAction } from '@/components/admin/ui';

export function SubBrandsList({ rows: initial }: { rows: { id: number; name: string; slug: string; enabled: boolean; markerHex: string; emotion: string }[] }) {
  const [rows, setRows] = useState(initial);
  const { notice, setNotice, run } = useAction();
  const move = async (i: number, d: number) => {
    const next = [...rows];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    setRows(next);
    await run('order', () => reorderSubBrands(next.map((r) => r.id)), 'Urutan disimpan.');
  };
  return (
    <div className="space-y-4">
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      <Card>
        <ul className="divide-y divide-stone-100">
          {rows.map((r, i) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="flex">
                <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Naikkan ${r.name}`}><ArrowUp size={14} /></Button>
                <Button size="sm" variant="ghost" disabled={i === rows.length - 1} onClick={() => move(i, 1)} aria-label={`Turunkan ${r.name}`}><ArrowDown size={14} /></Button>
              </div>
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: r.markerHex }} aria-hidden />
              <div className="flex-1">
                <Link href={`/admin/sub-brands/${r.id}`} className="font-medium hover:underline">{r.name}</Link>
                <p className="text-xs text-stone-500">/{r.slug} · emosi: {r.emotion}</p>
              </div>
              {r.enabled ? <Badge tone="green">Tampil</Badge> : <Badge>Disembunyikan</Badge>}
              <Link href={`/admin/sub-brands/${r.id}`} className="rounded-md border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50">Ubah</Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
