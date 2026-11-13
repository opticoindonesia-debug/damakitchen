'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { saveCollection, type CollectionKind, type CollectionRow } from '@/app/admin/actions/misc';
import { Button, Card, Input, NoticeBar, Select, Textarea, Toggle, confirmAction, useAction } from '@/components/admin/ui';
import { ICON_OPTIONS } from '@/lib/sections/definitions';
import { cn } from '@/lib/utils';

const TABS: { key: CollectionKind; label: string; title: string; subtitle: string; body: string; help: string }[] = [
  { key: 'testimonials', label: 'Testimoni', title: 'Nama', subtitle: 'Konteks (mis. Pelanggan LAMAK DAMA)', body: 'Kutipan', help: 'Hanya dari pelanggan sungguhan yang sudah memberi izin.' },
  { key: 'faqs', label: 'Tanya jawab', title: 'Pertanyaan', subtitle: 'Kelompok (opsional)', body: 'Jawaban', help: 'Tampil lewat blok data “Tanya jawab (dari menu FAQ)”.' },
  { key: 'pillars', label: 'Pilar brand', title: 'Judul', subtitle: 'Ikon', body: 'Penjelasan', help: 'Empat hal yang tak ditawar.' },
  { key: 'values', label: 'Nilai brand', title: 'Judul', subtitle: '', body: 'Penjelasan', help: 'Nilai yang dijaga tim DAMA.' },
];

export function CollectionsEditor({ data }: { data: Record<CollectionKind, CollectionRow[]> }) {
  const [tab, setTab] = useState<CollectionKind>('testimonials');
  const [rows, setRows] = useState(data);
  const { busy, notice, setNotice, run } = useAction();
  const t = TABS.find((x) => x.key === tab)!;
  const list = rows[tab];
  const setList = (l: CollectionRow[]) => setRows({ ...rows, [tab]: l });
  const move = (i: number, d: number) => {
    const n = [...list];
    const [x] = n.splice(i, 1);
    n.splice(i + d, 0, x);
    setList(n);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b border-stone-200" role="tablist">
        {TABS.map((x) => (
          <button key={x.key} type="button" role="tab" aria-selected={tab === x.key} onClick={() => setTab(x.key)} className={cn('-mb-px border-b-2 px-4 py-2 text-sm font-medium', tab === x.key ? 'border-[#1F4D4D] text-[#1F4D4D]' : 'border-transparent text-stone-600')}>
            {x.label} ({rows[x.key].length})
          </button>
        ))}
      </div>
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      <Card title={t.label} description={t.help} actions={<Button variant="publish" busy={busy === 'save'} onClick={() => run('save', () => saveCollection(tab, list))}>Simpan {t.label.toLowerCase()}</Button>}>
        <ul className="space-y-3">
          {list.map((r, i) => (
            <li key={r.id ?? `n${i}`} className={cn('space-y-2 rounded-lg border border-stone-200 p-3', !r.visible && 'opacity-60')}>
              <div className="flex flex-wrap items-center gap-2">
                <Input value={r.title} onChange={(e) => setList(list.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder={t.title} aria-label={`${t.title} ${i + 1}`} className="min-w-[200px] flex-1" />
                {tab === 'pillars' ? (
                  <Select value={r.subtitle} onChange={(e) => setList(list.map((x, j) => (j === i ? { ...x, subtitle: e.target.value } : x)))} className="max-w-[220px]" aria-label={`Ikon ${i + 1}`}>
                    {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                ) : t.subtitle ? (
                  <Input value={r.subtitle} onChange={(e) => setList(list.map((x, j) => (j === i ? { ...x, subtitle: e.target.value } : x)))} placeholder={t.subtitle} aria-label={`${t.subtitle} ${i + 1}`} className="min-w-[200px] flex-1" />
                ) : null}
                <Toggle checked={r.visible} onChange={(visible) => setList(list.map((x, j) => (j === i ? { ...x, visible } : x)))} label="Tampil" />
                <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Naikkan"><ArrowUp size={14} /></Button>
                <Button size="sm" variant="ghost" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Turunkan"><ArrowDown size={14} /></Button>
                <Button size="sm" variant="ghost" onClick={() => confirmAction('Hapus baris ini?') && setList(list.filter((_, j) => j !== i))} aria-label="Hapus"><Trash2 size={14} /></Button>
              </div>
              <Textarea value={r.body} onChange={(e) => setList(list.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} placeholder={t.body} rows={2} aria-label={`${t.body} ${i + 1}`} />
            </li>
          ))}
        </ul>
        <Button className="mt-3" size="sm" onClick={() => setList([...list, { title: '', subtitle: tab === 'pillars' ? 'recipe' : '', body: '', visible: true }])}><Plus size={14} /> Tambah</Button>
      </Card>
    </div>
  );
}
