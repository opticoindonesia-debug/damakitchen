'use client';

import { useState } from 'react';
import { deleteInquiry, updateInquiry } from '@/app/admin/actions/misc';
import { Badge, Button, Card, EmptyState, NoticeBar, Select, Textarea, confirmAction, useAction } from '@/components/admin/ui';
import { INQUIRY_FIELDS, type InquiryType } from '@/lib/inquiry';

type Row = {
  id: number;
  type: string;
  name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  data: Record<string, string>;
  pagePath: string | null;
  source: Record<string, string> | null;
  status: string;
  note: string | null;
  createdAt: string;
};

const TYPE: Record<string, string> = { catering: 'Katering', gifting: 'Hadiah', corporate: 'Corporate', general: 'Umum' };
const STATUS: Record<string, string> = { new: 'Baru', contacted: 'Sudah dihubungi', quoted: 'Penawaran dikirim', won: 'Jadi pesan', lost: 'Tidak jadi', spam: 'Spam' };

const waLink = (phone: string) => {
  let n = phone.replace(/[^0-9]/g, '');
  if (n.startsWith('0')) n = `62${n.slice(1)}`;
  return `https://wa.me/${n}`;
};

export function InquiriesList({ rows: initial }: { rows: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const { notice, setNotice, run } = useAction();
  const list = rows.filter((r) => !filter || r.status === filter);

  return (
    <div className="space-y-4">
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-[220px]" aria-label="Saring status">
        <option value="">Semua status ({rows.length})</option>
        {Object.entries(STATUS).map(([k, v]) => (
          <option key={k} value={k}>{v} ({rows.filter((r) => r.status === k).length})</option>
        ))}
      </Select>
      <Card>
        {list.length === 0 ? (
          <EmptyState>Belum ada permintaan.</EmptyState>
        ) : (
          <ul className="divide-y divide-stone-100">
            {list.map((r) => (
              <li key={r.id} className="py-3">
                <button type="button" className="flex w-full flex-wrap items-center gap-3 text-left" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}>
                  <Badge tone={r.status === 'new' ? 'amber' : r.status === 'won' ? 'green' : 'neutral'}>{STATUS[r.status] ?? r.status}</Badge>
                  <span className="text-xs text-stone-500">{TYPE[r.type] ?? r.type}</span>
                  <span className="font-medium">{r.company ? `${r.company} — ` : ''}{r.name ?? '(tanpa nama)'}</span>
                  <span className="ml-auto text-xs text-stone-500">{new Date(r.createdAt).toLocaleString('id-ID')}</span>
                </button>
                {open === r.id && (
                  <div className="mt-3 space-y-3 rounded-lg bg-stone-50 p-4 text-sm">
                    <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-[200px_1fr]">
                      {(INQUIRY_FIELDS[r.type as InquiryType] ?? []).filter((f) => r.data[f.name]).map((f) => (
                        <div key={f.name} className="contents">
                          <dt className="text-stone-500">{f.label}</dt>
                          <dd className="whitespace-pre-line">{r.data[f.name]}</dd>
                        </div>
                      ))}
                      <dt className="text-stone-500">Dikirim dari</dt>
                      <dd>{r.pagePath ?? '—'}{r.source ? ` · sumber: ${Object.entries(r.source).map(([k, v]) => `${k}=${v}`).join(', ')}` : ''}</dd>
                    </dl>
                    <div className="flex flex-wrap gap-2">
                      {r.phone && <a href={waLink(r.phone)} target="_blank" rel="noopener noreferrer" className="rounded-md bg-[#1F4D4D] px-3 py-1.5 text-white">Chat WhatsApp</a>}
                      {r.email && <a href={`mailto:${r.email}`} className="rounded-md border border-stone-300 px-3 py-1.5">Kirim email</a>}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[220px_1fr_auto] sm:items-start">
                      <Select value={r.status} onChange={(e) => setRows(rows.map((x) => (x.id === r.id ? { ...x, status: e.target.value } : x)))} aria-label="Status">
                        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </Select>
                      <Textarea value={r.note ?? ''} onChange={(e) => setRows(rows.map((x) => (x.id === r.id ? { ...x, note: e.target.value } : x)))} placeholder="Catatan internal (mis. nilai penawaran, tindak lanjut)" rows={2} aria-label="Catatan" />
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" onClick={() => run('save', () => updateInquiry(r.id, { status: r.status, note: r.note ?? '' }))}>Simpan</Button>
                        <Button variant="danger" size="sm" onClick={async () => {
                          if (!confirmAction('Hapus permintaan ini beserta data pribadinya?')) return;
                          const res = await run('del', () => deleteInquiry(r.id));
                          if (res.ok) setRows(rows.filter((x) => x.id !== r.id));
                        }}>Hapus</Button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
