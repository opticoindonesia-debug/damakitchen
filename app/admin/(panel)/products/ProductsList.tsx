'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { deleteProduct, duplicateProduct, reorderProducts, saveCategories, setProductPrice, setProductStatus } from '@/app/admin/actions/catalog';
import { Button, Card, Input, NoticeBar, Select, StatusBadge, confirmAction, useAction } from '@/components/admin/ui';

interface Row {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  status: string;
  availability: string;
  image: string | null;
  subBrand: string | null;
  subBrandId: number | null;
}

export function ProductsList({ rows: initial, subBrands, categories: initialCats }: { rows: Row[]; subBrands: { id: number; name: string }[]; categories: { id: number; name: string; slug: string }[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState('');
  const [sb, setSb] = useState('');
  const [status, setStatus] = useState('');
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [cats, setCats] = useState(initialCats);
  const { busy, notice, setNotice, run } = useAction();

  const filtered = rows.filter(
    (r) => (!q || r.name.toLowerCase().includes(q.toLowerCase())) && (!sb || String(r.subBrandId) === sb) && (!status || r.status === status),
  );
  const canReorder = !q && !sb && !status;

  const move = async (i: number, d: number) => {
    const next = [...rows];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    setRows(next);
    await run('order', () => reorderProducts(next.map((r) => r.id)));
  };

  return (
    <div className="space-y-6">
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      <Card>
        <div className="mb-4 flex flex-wrap gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk…" className="max-w-xs" aria-label="Cari produk" />
          <Select value={sb} onChange={(e) => setSb(e.target.value)} className="max-w-[200px]" aria-label="Saring lini">
            <option value="">Semua lini</option>
            {subBrands.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[180px]" aria-label="Saring status">
            <option value="">Semua status</option>
            <option value="published">Tayang</option>
            <option value="draft">Draf</option>
            <option value="archived">Diarsipkan</option>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="w-16 py-2">Urutan</th>
                <th className="py-2">Produk</th>
                <th className="py-2">Lini</th>
                <th className="py-2">Harga (Rp)</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((r) => {
                const i = rows.findIndex((x) => x.id === r.id);
                return (
                  <tr key={r.id}>
                    <td className="py-2">
                      <div className="flex">
                        <Button size="sm" variant="ghost" disabled={!canReorder || i === 0} onClick={() => move(i, -1)} aria-label={`Naikkan ${r.name}`}><ArrowUp size={14} /></Button>
                        <Button size="sm" variant="ghost" disabled={!canReorder || i === rows.length - 1} onClick={() => move(i, 1)} aria-label={`Turunkan ${r.name}`}><ArrowDown size={14} /></Button>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-3">
                        {r.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.image.startsWith('/media/') ? `${r.image}?w=640` : r.image} alt="" className="h-10 w-12 rounded object-cover" />
                        ) : (
                          <div className="h-10 w-12 rounded bg-stone-100" />
                        )}
                        <Link href={`/admin/products/${r.id}`} className="font-medium hover:underline">{r.name}</Link>
                      </div>
                    </td>
                    <td className="py-2 text-stone-600">{r.subBrand ?? '—'}</td>
                    <td className="py-2">
                      <form
                        className="flex items-center gap-1"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const v = prices[r.id] ?? (r.price == null ? '' : String(r.price));
                          const res = await run(`price-${r.id}`, () => setProductPrice(r.id, v));
                          if (res.ok) setRows((x) => x.map((y) => (y.id === r.id ? { ...y, price: v ? Number(v.replace(/[^0-9]/g, '')) : null } : y)));
                        }}
                      >
                        <Input
                          inputMode="numeric"
                          value={prices[r.id] ?? (r.price == null ? '' : String(r.price))}
                          onChange={(e) => setPrices((p) => ({ ...p, [r.id]: e.target.value }))}
                          placeholder="belum ada"
                          className="w-28"
                          aria-label={`Harga ${r.name}`}
                        />
                        {prices[r.id] !== undefined && prices[r.id] !== (r.price == null ? '' : String(r.price)) && (
                          <Button type="submit" size="sm" variant="primary" busy={busy === `price-${r.id}`}>Simpan</Button>
                        )}
                      </form>
                    </td>
                    <td className="py-2">
                      <Select
                        value={r.status}
                        onChange={async (e) => {
                          const v = e.target.value;
                          const res = await run(`st-${r.id}`, () => setProductStatus(r.id, v));
                          if (res.ok) setRows((x) => x.map((y) => (y.id === r.id ? { ...y, status: v } : y)));
                        }}
                        className="w-36"
                        aria-label={`Status ${r.name}`}
                      >
                        <option value="published">Tayang</option>
                        <option value="draft">Draf</option>
                        <option value="archived">Diarsipkan</option>
                      </Select>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/products/${r.id}`} className="rounded-md border border-stone-300 px-2.5 py-1.5 text-[13px] hover:bg-stone-50">Ubah</Link>
                        <Button size="sm" onClick={async () => {
                          const res = await run('dup', () => duplicateProduct(r.id));
                          if (res.ok) router.push(`/admin/products/${(res.data as { id: number }).id}`);
                        }}>Gandakan</Button>
                        <Button size="sm" variant="danger" onClick={async () => {
                          if (!confirmAction(`Hapus produk "${r.name}" secara permanen? (Pilihan lain: ubah status ke "Diarsipkan".)`)) return;
                          const res = await run('del', () => deleteProduct(r.id));
                          if (res.ok) setRows((x) => x.filter((y) => y.id !== r.id));
                        }}>Hapus</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!canReorder && <p className="mt-3 text-xs text-stone-500">Hapus saringan untuk mengubah urutan.</p>}
      </Card>

      <Card title="Kategori produk" description="Dipakai untuk mengelompokkan produk (mis. Frozen, Hampers) dan blok “Produk pilihan / kategori”.">
        <ul className="space-y-2">
          {cats.map((c, i) => (
            <li key={c.id || `new-${i}`} className="flex gap-2">
              <Input value={c.name} onChange={(e) => setCats(cats.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} aria-label={`Kategori ${i + 1}`} />
              <Input value={c.slug} onChange={(e) => setCats(cats.map((x, j) => (j === i ? { ...x, slug: e.target.value } : x)))} className="max-w-[220px]" aria-label={`Slug kategori ${i + 1}`} placeholder="slug otomatis" />
              <Button size="sm" variant="ghost" onClick={() => confirmAction(`Hapus kategori "${c.name}"? Produk di dalamnya tidak ikut terhapus.`) && setCats(cats.filter((_, j) => j !== i))} aria-label="Hapus kategori"><Trash2 size={14} /></Button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => setCats([...cats, { id: 0, name: '', slug: '' }])}><Plus size={14} /> Tambah kategori</Button>
          <Button size="sm" variant="primary" busy={busy === 'cats'} onClick={async () => {
            const res = await run('cats', () => saveCategories(cats.map((c) => ({ id: c.id || undefined, name: c.name, slug: c.slug }))));
            if (res.ok && res.data) setCats(res.data as typeof cats);
          }}>Simpan kategori</Button>
        </div>
      </Card>
    </div>
  );
}
