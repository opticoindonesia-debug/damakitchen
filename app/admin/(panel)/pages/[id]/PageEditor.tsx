'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { discardPageChanges, publishPage, savePageDraft, unpublishPage } from '@/app/admin/actions/pages';
import { Button, Card, Field, Input, NoticeBar, PageHeader, StatusBadge, confirmAction, useAction } from '@/components/admin/ui';
import { SectionsEditor } from '@/components/admin/SectionsEditor';
import { SeoEditor } from '@/components/admin/SeoEditor';
import { AutosaveLabel, useAutosave } from '@/components/admin/useAutosave';
import type { FormContext } from '@/components/admin/SchemaForm';
import type { SeoFields } from '@/lib/db/schema';
import { slugify } from '@/lib/text';
import { cn } from '@/lib/utils';

type Section = Record<string, unknown> & { _type: string; _key: string };
interface Doc {
  title: string;
  slug: string;
  sections: Section[];
  seo: SeoFields;
}

export function PageEditor({ id, builtIn, path: initialPath, initial, status: initialStatus, hasChanges, ctx }: { id: number; builtIn: boolean; path: string; initial: Doc; status: string; hasChanges: boolean; ctx: FormContext }) {
  const router = useRouter();
  const [doc, setDoc] = useState<Doc>(initial);
  const [status, setStatus] = useState(initialStatus);
  const [changed, setChanged] = useState(hasChanges);
  const [tab, setTab] = useState<'layout' | 'seo'>('layout');
  const { busy, notice, setNotice, run } = useAction();
  const path = builtIn ? initialPath : `/${doc.slug}`;

  const saveDraft = useCallback(
    async (d: Doc) => {
      const res = await savePageDraft(id, d);
      setChanged(true);
      if (!res.ok) setNotice({ tone: 'error', text: res.error, details: res.problems });
      return res.ok;
    },
    [id, setNotice],
  );
  const autosave = useAutosave(doc, saveDraft);

  async function preview() {
    const res = await run('preview', () => savePageDraft(id, doc));
    if (res.ok || res.problems) {
      autosave.markSaved();
      window.open(`/api/admin/preview/enable?path=${encodeURIComponent(path)}`, '_blank', 'noopener');
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        back={{ href: '/admin/pages', label: 'Semua halaman' }}
        title={doc.title || 'Halaman tanpa judul'}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} hasChanges={changed} />
            <a href={path} target="_blank" rel="noopener noreferrer" className="text-stone-500 underline">
              {path}
            </a>
            <AutosaveLabel state={autosave.state} />
          </span>
        }
        actions={
          <>
            <Button busy={busy === 'save'} onClick={() => run('save', () => savePageDraft(id, doc)).then((r) => r.ok && autosave.markSaved())}>
              Simpan draf
            </Button>
            <Button busy={busy === 'preview'} onClick={preview}>
              Pratinjau
            </Button>
            <Button
              variant="publish"
              busy={busy === 'publish'}
              onClick={async () => {
                const res = await run('publish', () => publishPage(id, doc));
                if (res.ok) {
                  setStatus('published');
                  setChanged(false);
                  autosave.markSaved();
                  router.refresh();
                }
              }}
            >
              Terbitkan
            </Button>
          </>
        }
      />
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul halaman" htmlFor="page-title">
            <Input id="page-title" value={doc.title} onChange={(e) => setDoc({ ...doc, title: e.target.value })} />
          </Field>
          <Field label="Alamat (slug)" htmlFor="page-slug" help={builtIn ? 'Alamat halaman utama tidak bisa diubah.' : 'Jika diubah setelah terbit, alamat lama otomatis dialihkan ke yang baru.'}>
            <div className="flex items-center gap-1">
              <span className="text-sm text-stone-500">/</span>
              <Input id="page-slug" value={doc.slug} disabled={builtIn} onChange={(e) => setDoc({ ...doc, slug: slugify(e.target.value.replace(/\s/g, '-')) })} />
            </div>
          </Field>
        </div>
      </Card>

      <div className="flex gap-1 border-b border-stone-200" role="tablist">
        {(
          [
            ['layout', 'Susunan & isi'],
            ['seo', 'SEO'],
          ] as const
        ).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('-mb-px border-b-2 px-4 py-2 text-sm font-medium', tab === k ? 'border-[#1F4D4D] text-[#1F4D4D]' : 'border-transparent text-stone-600 hover:text-stone-900')}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'layout' ? (
        <SectionsEditor sections={doc.sections} onChange={(sections) => setDoc({ ...doc, sections })} ctx={ctx} />
      ) : (
        <Card>
          <SeoEditor value={doc.seo} onChange={(seo) => setDoc({ ...doc, seo })} fallbackTitle={`${doc.title} · DAMA KITCHEN`} fallbackDescription="(deskripsi bawaan situs)" path={path} />
        </Card>
      )}

      <Card title="Lainnya">
        <div className="flex flex-wrap gap-2">
          {status === 'published' && changed && (
            <Button
              busy={busy === 'discard'}
              onClick={async () => {
                if (!confirmAction('Buang semua perubahan yang belum diterbitkan dan kembali ke versi yang sedang tayang?')) return;
                const res = await run('discard', () => discardPageChanges(id));
                if (res.ok && res.data) {
                  setDoc(res.data as unknown as Doc);
                  setChanged(false);
                }
              }}
            >
              Batalkan perubahan
            </Button>
          )}
          {!builtIn && status === 'published' && (
            <Button
              variant="danger"
              busy={busy === 'unpublish'}
              onClick={async () => {
                if (!confirmAction('Sembunyikan halaman ini dari website? Isinya tetap tersimpan sebagai draf.')) return;
                const res = await run('unpublish', () => unpublishPage(id));
                if (res.ok) setStatus('draft');
              }}
            >
              Batal terbitkan
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
