'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { saveProduct } from '@/app/admin/actions/catalog';
import { Button, Card, Field, Input, NoticeBar, PageHeader, Select, Textarea, useAction } from '@/components/admin/ui';
import { GalleryField, ImageField } from '@/components/admin/media';
import { SeoEditor } from '@/components/admin/SeoEditor';
import type { SeoFields } from '@/lib/db/schema';
import type { ImageValue } from '@/lib/text';
import { slugify } from '@/lib/text';
import { formatRupiah } from '@/lib/utils';

export interface ProductForm {
  name: string;
  slug: string;
  subBrandId: number | null;
  categoryId: number | null;
  blurb: string;
  description: string;
  price: string;
  priceNote: string;
  availability: string;
  status: string;
  image?: ImageValue;
  gallery: ImageValue[];
  info: string[];
  imageCategory: string;
  orderLinks: { label: string; url: string }[];
  seo: SeoFields;
}

const INFO = [
  ['halal', 'Halal'],
  ['pedas', 'Pedas'],
  ['sambal-terpisah', 'Sambal terpisah'],
  ['porsi', 'Info porsi'],
];

export function ProductEditor({ id, initial, subBrands, categories }: { id: number | null; initial: ProductForm; subBrands: { id: number; name: string }[]; categories: { id: number; name: string }[] }) {
  const router = useRouter();
  const [f, setF] = useState<ProductForm>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const { busy, notice, setNotice, run } = useAction();
  const set = (patch: Partial<ProductForm>) => setF((x) => ({ ...x, ...patch }));
  const priceNum = Number(f.price.replace(/[^0-9]/g, ''));

  async function save() {
    const res = await run('save', () => saveProduct(id, { ...f, image: f.image ?? null, gallery: f.gallery, seo: f.seo }));
    if (res.ok && !id) router.replace(`/admin/products/${(res.data as { id: number }).id}`);
    else if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-5">
      <PageHeader
        back={{ href: '/admin/products', label: 'Semua produk' }}
        title={f.name || 'Produk baru'}
        description={id ? <a className="underline" href={`/menu/${f.slug}`} target="_blank" rel="noopener noreferrer">/menu/{f.slug}</a> : 'Isi data lalu simpan.'}
        actions={
          <>
            <Select value={f.status} onChange={(e) => set({ status: e.target.value })} className="w-44" aria-label="Status produk">
              <option value="published">Tayang di website</option>
              <option value="draft">Draf (tersembunyi)</option>
              <option value="archived">Diarsipkan</option>
            </Select>
            <Button variant="publish" busy={busy === 'save'} onClick={save}>
              Simpan
            </Button>
          </>
        }
      />
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card title="Informasi produk">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama produk" htmlFor="p-name">
                <Input id="p-name" value={f.name} onChange={(e) => set({ name: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })} required />
              </Field>
              <Field label="Alamat (slug)" htmlFor="p-slug" help="Bagian akhir alamat: /menu/…">
                <Input id="p-slug" value={f.slug} onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value.replace(/\s/g, '-')) }); }} />
              </Field>
              <Field label="Lini (sub-brand)" htmlFor="p-sb">
                <Select id="p-sb" value={f.subBrandId ?? ''} onChange={(e) => set({ subBrandId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">— tanpa lini —</option>
                  {subBrands.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Kategori" htmlFor="p-cat">
                <Select id="p-cat" value={f.categoryId ?? ''} onChange={(e) => set({ categoryId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">— tanpa kategori —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-4 space-y-4">
              <Field label="Kalimat singkat (tampil di kartu menu)" htmlFor="p-blurb" help="Jujur & hangat, tanpa superlatif.">
                <Textarea id="p-blurb" value={f.blurb} onChange={(e) => set({ blurb: e.target.value })} maxLength={400} rows={2} />
              </Field>
              <Field label="Deskripsi lengkap (halaman produk)" htmlFor="p-desc" help="Pisahkan paragraf dengan baris kosong.">
                <Textarea id="p-desc" value={f.description} onChange={(e) => set({ description: e.target.value })} rows={6} />
              </Field>
            </div>
          </Card>

          <Card title="Foto">
            <div className="space-y-5">
              <ImageField label="Foto utama" value={f.image} onChange={(image) => set({ image })} />
              <GalleryField label="Galeri tambahan" value={f.gallery} onChange={(gallery) => set({ gallery })} withCaption={false} />
              <Field label="Gaya placeholder (bila belum ada foto)" htmlFor="p-imgcat">
                <Select id="p-imgcat" value={f.imageCategory} onChange={(e) => set({ imageCategory: e.target.value })} className="max-w-xs">
                  <option value="food">Hidangan</option>
                  <option value="product">Produk / kemasan</option>
                  <option value="ingredients">Bahan</option>
                  <option value="process">Proses</option>
                  <option value="lifestyle">Suasana</option>
                </Select>
              </Field>
            </div>
          </Card>

          <Card title="SEO">
            <SeoEditor value={f.seo} onChange={(seo) => set({ seo })} fallbackTitle={`${f.name} · DAMA KITCHEN`} fallbackDescription={f.blurb} path={`/menu/${f.slug}`} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Harga & ketersediaan">
            <div className="space-y-4">
              <Field label="Harga (Rupiah)" htmlFor="p-price" help={f.price ? `Tampil sebagai: ${formatRupiah(priceNum)}` : 'Kosongkan bila harga belum ingin ditampilkan.'}>
                <Input id="p-price" inputMode="numeric" value={f.price} onChange={(e) => set({ price: e.target.value.replace(/[^0-9]/g, '') })} placeholder="mis. 85000" />
              </Field>
              <Field label="Keterangan harga" htmlFor="p-pnote" help='mis. "/ porsi", "mulai dari", "/ 500 gr"'>
                <Input id="p-pnote" value={f.priceNote} onChange={(e) => set({ priceNote: e.target.value })} />
              </Field>
              <Field label="Ketersediaan" htmlFor="p-avail">
                <Select id="p-avail" value={f.availability} onChange={(e) => set({ availability: e.target.value })}>
                  <option value="available">Tersedia</option>
                  <option value="preorder">Pre-order</option>
                  <option value="seasonal">Musiman</option>
                  <option value="unavailable">Sedang tidak tersedia</option>
                </Select>
              </Field>
            </div>
          </Card>
          <Card title="Ikon info">
            <div className="grid gap-2">
              {INFO.map(([v, label]) => (
                <label key={v} className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={f.info.includes(v)} onChange={(e) => set({ info: e.target.checked ? [...f.info, v] : f.info.filter((x) => x !== v) })} />
                  {label}
                </label>
              ))}
            </div>
          </Card>
          <Card title="Tombol pesan khusus" description="Opsional: tautan langsung ke produk ini di Shopee/TikTok. Tombol kanal lini & WhatsApp tetap tampil.">
            <div className="space-y-2">
              {f.orderLinks.map((l, i) => (
                <div key={i} className="space-y-1.5 rounded-md border border-stone-200 p-2">
                  <Input value={l.label} onChange={(e) => set({ orderLinks: f.orderLinks.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} placeholder="Tulisan tombol, mis. Beli di Shopee" aria-label={`Tombol pesan ${i + 1}: tulisan`} />
                  <div className="flex gap-1">
                    <Input value={l.url} onChange={(e) => set({ orderLinks: f.orderLinks.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} placeholder="https://shopee.co.id/…" aria-label={`Tombol pesan ${i + 1}: tautan`} />
                    <Button size="sm" variant="ghost" onClick={() => set({ orderLinks: f.orderLinks.filter((_, j) => j !== i) })} aria-label="Hapus tombol"><Trash2 size={14} /></Button>
                  </div>
                </div>
              ))}
              <Button size="sm" disabled={f.orderLinks.length >= 5} onClick={() => set({ orderLinks: [...f.orderLinks, { label: '', url: '' }] })}>
                <Plus size={14} /> Tambah tombol
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
