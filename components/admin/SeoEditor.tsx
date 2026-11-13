'use client';

import type { SeoFields } from '@/lib/db/schema';
import type { ImageValue } from '@/lib/text';
import { Field, Input, Textarea, Toggle } from './ui';
import { ImageField } from './media';
import { cn } from '@/lib/utils';

function Counter({ n, ideal }: { n: number; ideal: number }) {
  return <span className={cn('text-xs', n > ideal ? 'text-amber-700' : 'text-stone-500')}>{n}/{ideal} karakter</span>;
}

/** SEO fields for a page / article / product, with a Google-style preview. */
export function SeoEditor({ value, onChange, fallbackTitle, fallbackDescription, path }: { value: SeoFields; onChange: (v: SeoFields) => void; fallbackTitle: string; fallbackDescription: string; path: string }) {
  const set = (patch: Partial<SeoFields>) => onChange({ ...value, ...patch });
  const title = value.title || fallbackTitle;
  const desc = value.description || fallbackDescription;
  const canonicalOk = !value.canonical || /^\/(?!\/)\S*$/.test(value.canonical) || /^https:\/\/\S+$/.test(value.canonical);
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
        <p className="text-xs text-stone-500">Pratinjau di Google</p>
        <p className="mt-1 truncate text-[17px] text-[#1a0dab]">{title}</p>
        <p className="truncate text-xs text-emerald-800">damakitchen.id{path}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-stone-700">{desc}</p>
      </div>
      <Field label={<span className="flex justify-between gap-2">Judul SEO <Counter n={(value.title ?? '').length} ideal={60} /></span>} help={`Kosongkan untuk memakai: "${fallbackTitle}"`} htmlFor="seo-title">
        <Input id="seo-title" value={value.title ?? ''} onChange={(e) => set({ title: e.target.value })} maxLength={120} />
      </Field>
      <Field label={<span className="flex justify-between gap-2">Deskripsi SEO <Counter n={(value.description ?? '').length} ideal={160} /></span>} help="1–2 kalimat yang muncul di hasil pencarian." htmlFor="seo-desc">
        <Textarea id="seo-desc" value={value.description ?? ''} onChange={(e) => set({ description: e.target.value })} maxLength={320} rows={3} />
      </Field>
      <details className="rounded-lg border border-stone-200 p-3">
        <summary className="cursor-pointer text-sm font-medium">Lanjutan: media sosial, kanonis, indeks</summary>
        <div className="mt-4 space-y-4">
          <Field label="Judul saat dibagikan (Open Graph)" htmlFor="og-title">
            <Input id="og-title" value={value.ogTitle ?? ''} onChange={(e) => set({ ogTitle: e.target.value })} maxLength={120} />
          </Field>
          <Field label="Deskripsi saat dibagikan" htmlFor="og-desc">
            <Textarea id="og-desc" value={value.ogDescription ?? ''} onChange={(e) => set({ ogDescription: e.target.value })} maxLength={320} rows={2} />
          </Field>
          <ImageField label="Gambar saat dibagikan (1200×630 disarankan)" value={value.ogImage ?? undefined} onChange={(v: ImageValue | undefined) => set({ ogImage: v ?? null })} />
          <Field label="URL kanonis (opsional)" help="Biarkan kosong (disarankan). Isi hanya jika halaman ini salinan dari halaman lain." error={canonicalOk ? undefined : 'Gunakan alamat yang diawali "/" atau "https://".'} htmlFor="canonical">
            <Input id="canonical" value={value.canonical ?? ''} onChange={(e) => set({ canonical: e.target.value })} placeholder={path} />
          </Field>
          <Toggle checked={value.noindex === true} onChange={(v) => set({ noindex: v })} label="Sembunyikan dari Google (noindex) & dari sitemap" />
        </div>
      </details>
    </div>
  );
}
