'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { discardArticleChanges, publishArticle, saveArticleDraft, unpublishArticle } from '@/app/admin/actions/articles';
import { Button, Card, Field, Input, NoticeBar, PageHeader, Select, StatusBadge, Textarea, confirmAction, useAction } from '@/components/admin/ui';
import { ImageField } from '@/components/admin/media';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { SeoEditor } from '@/components/admin/SeoEditor';
import { AutosaveLabel, useAutosave } from '@/components/admin/useAutosave';
import type { SeoFields } from '@/lib/db/schema';
import type { ImageValue } from '@/lib/text';
import { slugify } from '@/lib/text';

interface Form {
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  featuredImage?: ImageValue;
  author: string;
  categoryId: number | null;
  publishedAt: string;
  tags: string[];
  relatedIds: number[];
  seo: SeoFields;
}

export function ArticleEditor({ id, initial, status: s0, hasChanges, categories, others, tagSuggestions }: { id: number; initial: Form; status: string; hasChanges: boolean; categories: { id: number; name: string }[]; others: { id: number; title: string }[]; tagSuggestions: string[] }) {
  const router = useRouter();
  const [f, setF] = useState<Form>(initial);
  const [status, setStatus] = useState(s0);
  const [changed, setChanged] = useState(hasChanges);
  const [tagText, setTagText] = useState(initial.tags.join(', '));
  const { busy, notice, setNotice, run } = useAction();
  const set = (patch: Partial<Form>) => setF((x) => ({ ...x, ...patch }));
  const payload = (x: Form) => ({ ...x, featuredImage: x.featuredImage ?? null });
  const path = `/catatan-dapur/${f.slug}`;

  const saveDraft = useCallback(async (x: Form) => {
    const res = await saveArticleDraft(id, payload(x));
    setChanged(true);
    if (!res.ok) setNotice({ tone: 'error', text: res.error, details: res.problems });
    return res.ok;
  }, [id, setNotice]);
  const autosave = useAutosave(f, saveDraft);

  return (
    <div className="space-y-5">
      <PageHeader
        back={{ href: '/admin/articles', label: 'Semua artikel' }}
        title={f.title || 'Artikel tanpa judul'}
        description={<span className="flex flex-wrap items-center gap-2"><StatusBadge status={status} hasChanges={status === 'published' && changed} /><span className="text-stone-500">{path}</span><AutosaveLabel state={autosave.state} /></span>}
        actions={
          <>
            <Button busy={busy === 'save'} onClick={() => run('save', () => saveArticleDraft(id, payload(f))).then((r) => r.ok && autosave.markSaved())}>Simpan draf</Button>
            <Button busy={busy === 'preview'} onClick={async () => {
              const res = await run('preview', () => saveArticleDraft(id, payload(f)));
              if (res.ok) window.open(`/api/admin/preview/enable?path=${encodeURIComponent(path)}`, '_blank', 'noopener');
            }}>Pratinjau</Button>
            <Button variant="publish" busy={busy === 'publish'} onClick={async () => {
              const res = await run('publish', () => publishArticle(id, payload(f)));
              if (res.ok) { setStatus('published'); setChanged(false); autosave.markSaved(); router.refresh(); }
            }}>Terbitkan</Button>
          </>
        }
      />
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card>
            <div className="space-y-4">
              <Field label="Judul" htmlFor="a-title"><Input id="a-title" value={f.title} onChange={(e) => set({ title: e.target.value })} /></Field>
              <Field label="Ringkasan (tampil di kartu artikel)" htmlFor="a-excerpt"><Textarea id="a-excerpt" value={f.excerpt} onChange={(e) => set({ excerpt: e.target.value })} rows={2} maxLength={600} /></Field>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-stone-800">Isi artikel</p>
                <RichTextEditor value={f.bodyHtml} onChange={(bodyHtml) => set({ bodyHtml })} label="Isi artikel" />
                <p className="text-xs text-stone-500">Gunakan “Judul bagian” untuk sub-judul. Untuk tautan ke halaman lain di website, tulis alamat seperti /menu atau /lamak-dama.</p>
              </div>
            </div>
          </Card>
          <Card title="SEO">
            <SeoEditor value={f.seo} onChange={(seo) => set({ seo })} fallbackTitle={`${f.title} · DAMA KITCHEN`} fallbackDescription={f.excerpt} path={path} />
          </Card>
        </div>
        <div className="space-y-5">
          <Card title="Detail">
            <div className="space-y-4">
              <Field label="Alamat (slug)" htmlFor="a-slug" help="Jika diubah setelah terbit, alamat lama otomatis dialihkan."><Input id="a-slug" value={f.slug} onChange={(e) => set({ slug: slugify(e.target.value.replace(/\s/g, '-')) })} /></Field>
              <Field label="Tanggal" htmlFor="a-date"><Input id="a-date" type="date" value={f.publishedAt} onChange={(e) => set({ publishedAt: e.target.value })} /></Field>
              <Field label="Penulis" htmlFor="a-author"><Input id="a-author" value={f.author} onChange={(e) => set({ author: e.target.value })} placeholder="mis. Tim Dapur DAMA" /></Field>
              <Field label="Kategori" htmlFor="a-cat">
                <Select id="a-cat" value={f.categoryId ?? ''} onChange={(e) => set({ categoryId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">— tanpa kategori —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Tag" htmlFor="a-tags" help="Pisahkan dengan koma.">
                <Input id="a-tags" value={tagText} list="tag-suggest" onChange={(e) => { setTagText(e.target.value); set({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }); }} />
                <datalist id="tag-suggest">{tagSuggestions.map((t) => <option key={t} value={t} />)}</datalist>
              </Field>
            </div>
          </Card>
          <Card title="Foto sampul"><ImageField label="Foto sampul" value={f.featuredImage} onChange={(featuredImage) => set({ featuredImage })} /></Card>
          <Card title="Artikel terkait" description="Kosongkan agar dipilih otomatis dari kategori yang sama.">
            <div className="max-h-56 space-y-1.5 overflow-y-auto">
              {others.length === 0 && <p className="text-xs text-stone-500">Belum ada artikel lain.</p>}
              {others.map((o) => (
                <label key={o.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={f.relatedIds.includes(o.id)} onChange={(e) => set({ relatedIds: e.target.checked ? [...f.relatedIds, o.id] : f.relatedIds.filter((x) => x !== o.id) })} />
                  {o.title}
                </label>
              ))}
            </div>
          </Card>
          <Card title="Lainnya">
            <div className="flex flex-wrap gap-2">
              {status === 'published' && changed && (
                <Button onClick={async () => {
                  if (!confirmAction('Buang perubahan yang belum diterbitkan?')) return;
                  const res = await run('discard', () => discardArticleChanges(id));
                  if (res.ok) window.location.reload();
                }}>Batalkan perubahan</Button>
              )}
              {status === 'published' && (
                <Button variant="danger" onClick={async () => {
                  if (!confirmAction('Sembunyikan artikel ini dari website?')) return;
                  const res = await run('unpub', () => unpublishArticle(id));
                  if (res.ok) setStatus('draft');
                }}>Batal terbitkan</Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
