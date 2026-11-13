'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { deleteSubBrand, saveSubBrand } from '@/app/admin/actions/catalog';
import { Button, Card, Field, Input, NoticeBar, PageHeader, Textarea, Toggle, confirmAction, useAction } from '@/components/admin/ui';
import { ImageField } from '@/components/admin/media';
import { SeoEditor } from '@/components/admin/SeoEditor';
import { SectionsEditor } from '@/components/admin/SectionsEditor';
import type { FormContext } from '@/components/admin/SchemaForm';
import { CHANNEL_OPTIONS } from '@/lib/sections/definitions';
import type { SeoFields } from '@/lib/db/schema';
import type { ImageValue } from '@/lib/text';
import { slugify } from '@/lib/text';

export interface SubBrandForm {
  slug: string;
  name: string;
  shortName: string;
  emotion: string;
  lead: string;
  about: string;
  howToOrder: string;
  channelNote: string;
  markerHex: string;
  heroImage?: ImageValue;
  channels: string[];
  faqs: { q: string; a: string }[];
  crossSell: string[];
  extraSections: (Record<string, unknown> & { _type: string; _key: string })[];
  seo: SeoFields;
  enabled: boolean;
}

export function SubBrandEditor({ id, initial, ctx, all }: { id: number | null; initial: SubBrandForm; ctx: FormContext; all: { slug: string; name: string }[] }) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const { busy, notice, setNotice, run } = useAction();
  const set = (patch: Partial<SubBrandForm>) => setF((x) => ({ ...x, ...patch }));

  return (
    <div className="space-y-5">
      <PageHeader
        back={{ href: '/admin/sub-brands', label: 'Semua sub-brand' }}
        title={f.name || 'Sub-brand baru'}
        description={id ? <a className="underline" href={`/${f.slug}`} target="_blank" rel="noopener noreferrer">/{f.slug}</a> : undefined}
        actions={
          <>
            <Toggle checked={f.enabled} onChange={(enabled) => set({ enabled })} label="Tampil di website" />
            <Button
              variant="publish"
              busy={busy === 'save'}
              onClick={async () => {
                const res = await run('save', () => saveSubBrand(id, { ...f, heroImage: f.heroImage ?? null }));
                if (res.ok && !id) router.replace(`/admin/sub-brands/${(res.data as { id: number }).id}`);
                else if (res.ok) router.refresh();
              }}
            >
              Simpan
            </Button>
          </>
        }
      />
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      <Card title="Identitas lini">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama" htmlFor="sb-name"><Input id="sb-name" value={f.name} onChange={(e) => set({ name: e.target.value, ...(id ? {} : { slug: slugify(e.target.value) }) })} /></Field>
          <Field label="Nama pendek (label kartu)" htmlFor="sb-short"><Input id="sb-short" value={f.shortName} onChange={(e) => set({ shortName: e.target.value })} /></Field>
          <Field label="Alamat (slug)" htmlFor="sb-slug" help={id ? 'Alamat lini tidak diubah setelah dibuat.' : undefined}><Input id="sb-slug" value={f.slug} disabled={Boolean(id)} onChange={(e) => set({ slug: slugify(e.target.value) })} /></Field>
          <Field label="Emosi (jangan ditukar antar lini)" htmlFor="sb-emo"><Input id="sb-emo" value={f.emotion} onChange={(e) => set({ emotion: e.target.value })} /></Field>
          <Field label="Warna penanda" htmlFor="sb-color">
            <div className="flex gap-2">
              <input type="color" value={/^#[0-9a-f]{6}$/i.test(f.markerHex) ? f.markerHex : '#1F7A6E'} onChange={(e) => set({ markerHex: e.target.value.toUpperCase() })} className="h-10 w-14 rounded border border-stone-300" aria-label="Pilih warna penanda" />
              <Input id="sb-color" value={f.markerHex} onChange={(e) => set({ markerHex: e.target.value })} className="max-w-[140px]" />
            </div>
          </Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="Kalimat utama (lead)" htmlFor="sb-lead"><Textarea id="sb-lead" value={f.lead} onChange={(e) => set({ lead: e.target.value })} rows={2} /></Field>
          <Field label="Tentang lini ini" htmlFor="sb-about"><Textarea id="sb-about" value={f.about} onChange={(e) => set({ about: e.target.value })} rows={4} /></Field>
          <Field label="Cara memesan" htmlFor="sb-how"><Textarea id="sb-how" value={f.howToOrder} onChange={(e) => set({ howToOrder: e.target.value })} rows={3} /></Field>
          <Field label="Catatan kanal (halaman Pesan)" htmlFor="sb-note"><Input id="sb-note" value={f.channelNote} onChange={(e) => set({ channelNote: e.target.value })} /></Field>
          <ImageField label="Foto hero" value={f.heroImage} onChange={(heroImage) => set({ heroImage })} />
        </div>
      </Card>

      <Card title="Kanal pemesanan" description="Urutan menentukan tombol utama di kartu produk (kanal pertama yang aktif).">
        <ul className="space-y-2">
          {f.channels.map((c, i) => (
            <li key={c} className="flex items-center gap-2 text-sm">
              <span className="w-40">{CHANNEL_OPTIONS.find((o) => o.value === c)?.label ?? c}</span>
              <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => { const n = [...f.channels]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; set({ channels: n }); }} aria-label="Naikkan"><ArrowUp size={14} /></Button>
              <Button size="sm" variant="ghost" disabled={i === f.channels.length - 1} onClick={() => { const n = [...f.channels]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; set({ channels: n }); }} aria-label="Turunkan"><ArrowDown size={14} /></Button>
              <Button size="sm" variant="ghost" onClick={() => set({ channels: f.channels.filter((x) => x !== c) })} aria-label="Hapus kanal"><Trash2 size={14} /></Button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          {CHANNEL_OPTIONS.filter((o) => !f.channels.includes(o.value)).map((o) => (
            <Button key={o.value} size="sm" onClick={() => set({ channels: [...f.channels, o.value] })}><Plus size={14} /> {o.label}</Button>
          ))}
        </div>
      </Card>

      <Card title="Tanya jawab lini">
        <div className="space-y-3">
          {f.faqs.map((q, i) => (
            <div key={i} className="space-y-1.5 rounded-md border border-stone-200 p-3">
              <div className="flex gap-2">
                <Input value={q.q} onChange={(e) => set({ faqs: f.faqs.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) })} placeholder="Pertanyaan" aria-label={`Pertanyaan ${i + 1}`} />
                <Button size="sm" variant="ghost" onClick={() => confirmAction('Hapus pertanyaan ini?') && set({ faqs: f.faqs.filter((_, j) => j !== i) })} aria-label="Hapus pertanyaan"><Trash2 size={14} /></Button>
              </div>
              <Textarea value={q.a} onChange={(e) => set({ faqs: f.faqs.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)) })} placeholder="Jawaban" rows={2} aria-label={`Jawaban ${i + 1}`} />
            </div>
          ))}
          <Button size="sm" onClick={() => set({ faqs: [...f.faqs, { q: '', a: '' }] })}><Plus size={14} /> Tambah pertanyaan</Button>
        </div>
      </Card>

      <Card title="Mungkin juga cocok… (lini lain yang disarankan)">
        <div className="flex flex-wrap gap-4">
          {all.filter((s) => s.slug !== f.slug).map((s) => (
            <label key={s.slug} className="inline-flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={f.crossSell.includes(s.slug)} onChange={(e) => set({ crossSell: e.target.checked ? [...f.crossSell, s.slug] : f.crossSell.filter((x) => x !== s.slug) })} />
              {s.name}
            </label>
          ))}
        </div>
      </Card>

      <Card title="Bagian tambahan di halaman lini" description="Tambahkan galeri, testimoni, FAQ, dll. di bawah konten bawaan halaman lini.">
        <SectionsEditor sections={f.extraSections} onChange={(extraSections) => set({ extraSections })} ctx={ctx} />
      </Card>

      <Card title="SEO">
        <SeoEditor value={f.seo} onChange={(seo) => set({ seo })} fallbackTitle={`${f.name} · DAMA KITCHEN`} fallbackDescription={f.lead} path={`/${f.slug}`} />
      </Card>

      {id && (
        <Card title="Hapus">
          <Button variant="danger" onClick={async () => {
            if (!confirmAction(`Hapus sub-brand "${f.name}" secara permanen? Lebih aman: matikan "Tampil di website".`)) return;
            const res = await run('del', () => deleteSubBrand(id));
            if (res.ok) router.push('/admin/sub-brands');
          }}>Hapus sub-brand</Button>
        </Card>
      )}
    </div>
  );
}
