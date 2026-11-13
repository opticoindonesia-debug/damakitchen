'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Trash2, Upload } from 'lucide-react';
import type { MediaItem } from '@/app/api/admin/media/route';
import type { ImageValue } from '@/lib/text';
import { Badge, Button, Field, Input, NoticeBar, Select, Textarea, confirmAction, type Notice } from './ui';
import { cn } from '@/lib/utils';

export type { MediaItem };

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

/** Loads one page of the media library. */
export function useMediaList(params: { q: string; folder: string; kind?: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    const sp = new URLSearchParams({ q: params.q, folder: params.folder || '*', ...(params.kind ? { kind: params.kind } : {}) });
    const res = await fetch(`/api/admin/media?${sp}`, { cache: 'no-store' });
    if (res.ok) {
      const j = await res.json();
      setItems(j.items);
      setFolders(j.folders);
      setTotal(j.total);
    }
    setLoading(false);
  }, [params.q, params.folder, params.kind]);
  useEffect(() => {
    reload();
  }, [reload]);
  return { items, folders, total, loading, reload };
}

/** Upload control with drag & drop. Calls onDone with the created items. */
export function Uploader({ folder, onDone, accept = 'image/*,application/pdf', compact }: { folder?: string; onDone: (items: MediaItem[], errors: string[]) => void; accept?: string; compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setBusy(true);
    const fd = new FormData();
    list.forEach((f) => fd.append('files', f));
    if (folder) fd.append('folder', folder);
    try {
      const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        onDone([], [j.error ?? 'Unggahan gagal.']);
      } else {
        const results = j.results as { name: string; item?: MediaItem; error?: string }[];
        onDone(
          results.filter((r) => r.item).map((r) => r.item!),
          results.filter((r) => r.error).map((r) => `${r.name}: ${r.error}`),
        );
      }
    } catch {
      onDone([], ['Unggahan gagal (koneksi terputus).']);
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        upload(e.dataTransfer.files);
      }}
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-lg border-2 border-dashed px-4 text-sm text-stone-600',
        compact ? 'py-3' : 'py-6',
        drag ? 'border-[#1F4D4D] bg-[#1F4D4D]/5' : 'border-stone-300 bg-stone-50',
      )}
    >
      <input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} data-testid="media-file-input" />
      <Button variant="primary" busy={busy} onClick={() => inputRef.current?.click()}>
        <Upload size={16} /> Unggah file
      </Button>
      <span>atau seret foto ke sini. JPG, PNG, WebP, AVIF, GIF, PDF · maks. 8 MB.</span>
    </div>
  );
}

/** Modal to pick (or upload) an image from the library. */
export function MediaPicker({ open, onClose, onPick, multiple = false, kind = 'image' }: { open: boolean; onClose: () => void; onPick: (items: MediaItem[]) => void; multiple?: boolean; kind?: 'image' | 'document' }) {
  const [q, setQ] = useState('');
  const [folder, setFolder] = useState('');
  const [selected, setSelected] = useState<MediaItem[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const { items, folders, loading, reload } = useMediaList({ q, folder, kind });

  useEffect(() => {
    if (open) setSelected([]);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const toggle = (m: MediaItem) => {
    if (!multiple) return onPick([m]);
    setSelected((s) => (s.some((x) => x.id === m.id) ? s.filter((x) => x.id !== m.id) : [...s, m]));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Pilih dari media">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-t-xl bg-white shadow-xl sm:rounded-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
          <h2 className="text-base font-semibold">Pilih {kind === 'image' ? 'foto' : 'file'}</h2>
          <button type="button" onClick={onClose} className="rounded p-1.5 text-stone-500 hover:bg-stone-100" aria-label="Tutup">
            ✕
          </button>
        </div>
        <div className="space-y-3 border-b border-stone-200 px-5 py-3">
          <Uploader
            compact
            folder={folder}
            accept={kind === 'image' ? 'image/*' : 'application/pdf'}
            onDone={(created, errors) => {
              setNotice(errors.length ? { tone: 'error', text: 'Sebagian file gagal diunggah', details: errors } : null);
              reload();
              if (created.length && !multiple) onPick([created[0]]);
              if (created.length && multiple) setSelected((s) => [...s, ...created]);
            }}
          />
          <NoticeBar notice={notice} onClose={() => setNotice(null)} />
          <div className="flex flex-wrap gap-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau deskripsi…" className="max-w-xs" aria-label="Cari media" />
            <Select value={folder} onChange={(e) => setFolder(e.target.value)} className="max-w-[200px]" aria-label="Folder">
              <option value="">Semua folder</option>
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-sm text-stone-500">Memuat…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-stone-500">Belum ada file. Unggah di atas.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {items.map((m) => {
                const sel = selected.some((x) => x.id === m.id);
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => toggle(m)}
                      className={cn('group block w-full overflow-hidden rounded-lg border text-left', sel ? 'border-[#C65B3E] ring-2 ring-[#C65B3E]' : 'border-stone-200 hover:border-stone-400')}
                    >
                      {m.kind === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`${m.url}?w=640`} alt={m.alt} className="aspect-square w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex aspect-square items-center justify-center bg-stone-100 text-xs font-semibold text-stone-500">PDF</div>
                      )}
                      <p className="truncate px-2 py-1 text-xs text-stone-600">{m.name}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {multiple && (
          <div className="flex items-center justify-end gap-2 border-t border-stone-200 px-5 py-3">
            <span className="mr-auto text-sm text-stone-600">{selected.length} dipilih</span>
            <Button onClick={onClose}>Batal</Button>
            <Button variant="primary" disabled={!selected.length} onClick={() => onPick(selected)}>
              Tambahkan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const toImage = (m: MediaItem): ImageValue => ({ url: m.url, alt: m.alt || '', mediaId: m.id });

/** A single image field: preview, choose/replace, remove, alt text. */
export function ImageField({ value, onChange, label = 'Foto' }: { value?: ImageValue; onChange: (v: ImageValue | undefined) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-stone-800">{label}</p>
      <div className="flex flex-wrap items-start gap-3">
        {value?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url.startsWith('/media/') ? `${value.url}?w=640` : value.url} alt={value.alt ?? ''} className="h-24 w-32 rounded-md border border-stone-200 object-cover" />
        ) : (
          <div className="flex h-24 w-32 items-center justify-center rounded-md border border-dashed border-stone-300 bg-stone-50 text-xs text-stone-400">Belum ada foto</div>
        )}
        <div className="flex flex-col gap-2">
          <Button size="sm" onClick={() => setOpen(true)}>
            <ImagePlus size={15} /> {value?.url ? 'Ganti foto' : 'Pilih foto'}
          </Button>
          {value?.url && (
            <Button size="sm" variant="danger" onClick={() => onChange(undefined)}>
              Lepas foto
            </Button>
          )}
        </div>
      </div>
      {value?.url && (
        <Input
          value={value.alt ?? ''}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
          placeholder="Deskripsi foto (alt) — untuk Google & pembaca layar"
          aria-label={`${label}: deskripsi foto`}
        />
      )}
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onPick={(items) => {
          if (items[0]) onChange({ ...toImage(items[0]), alt: items[0].alt || value?.alt || '' });
          setOpen(false);
        }}
      />
    </div>
  );
}

/** Gallery: multiple images with alt + caption, reorderable. */
export function GalleryField({ value, onChange, label = 'Foto', withCaption = true }: { value: (ImageValue & { _key?: string })[]; onChange: (v: (ImageValue & { _key?: string })[]) => void; label?: string; withCaption?: boolean }) {
  const [open, setOpen] = useState(false);
  const move = (i: number, d: number) => {
    const next = [...value];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-800">{label}</p>
        <Button size="sm" onClick={() => setOpen(true)}>
          <ImagePlus size={15} /> Tambah foto
        </Button>
      </div>
      {value.length === 0 && <p className="text-xs text-stone-500">Belum ada foto.</p>}
      <ul className="space-y-2">
        {value.map((im, i) => (
          <li key={im._key ?? `${im.url}-${i}`} className="flex gap-3 rounded-md border border-stone-200 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={im.url.startsWith('/media/') ? `${im.url}?w=640` : im.url} alt={im.alt ?? ''} className="h-16 w-20 shrink-0 rounded object-cover" />
            <div className="grid flex-1 gap-1.5">
              <Input value={im.alt ?? ''} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} placeholder="Deskripsi foto (alt)" aria-label={`Foto ${i + 1}: alt`} />
              {withCaption && (
                <Input value={im.caption ?? ''} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} placeholder="Keterangan (opsional)" aria-label={`Foto ${i + 1}: keterangan`} />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Naikkan">
                <ArrowUp size={14} />
              </Button>
              <Button size="sm" variant="ghost" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Turunkan">
                <ArrowDown size={14} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Hapus foto">
                <Trash2 size={14} />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <MediaPicker
        open={open}
        multiple
        onClose={() => setOpen(false)}
        onPick={(items) => {
          onChange([...value, ...items.map((m) => ({ ...toImage(m), _key: Math.random().toString(36).slice(2, 10) }))]);
          setOpen(false);
        }}
      />
    </div>
  );
}

/** Full media library management (Admin → Media). */
export function MediaLibrary() {
  const [q, setQ] = useState('');
  const [folder, setFolder] = useState('');
  const [uploadFolder, setUploadFolder] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [active, setActive] = useState<MediaItem | null>(null);
  const { items, folders, total, loading, reload } = useMediaList({ q, folder });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className="space-y-2">
          <Uploader
            folder={uploadFolder}
            onDone={(created, errors) => {
              setNotice(
                errors.length
                  ? { tone: 'error', text: `${created.length} berhasil, ${errors.length} gagal`, details: errors }
                  : { tone: 'success', text: `${created.length} file berhasil diunggah.` },
              );
              reload();
            }}
          />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <label htmlFor="upload-folder" className="text-stone-600">Unggah ke folder:</label>
            <Input id="upload-folder" value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)} placeholder="mis. produk" className="max-w-[200px]" list="media-folders" />
            <datalist id="media-folders">
              {folders.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>
        </div>
        <NoticeBar notice={notice} onClose={() => setNotice(null)} />
        <div className="flex flex-wrap gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari…" className="max-w-xs" aria-label="Cari media" />
          <Select value={folder} onChange={(e) => setFolder(e.target.value)} className="max-w-[200px]" aria-label="Saring folder">
            <option value="">Semua folder</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
          <span className="self-center text-sm text-stone-500">{total} file</span>
        </div>
        {loading ? (
          <p className="text-sm text-stone-500">Memuat…</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setActive(m)}
                  className={cn('block w-full overflow-hidden rounded-lg border bg-white text-left', active?.id === m.id ? 'border-[#1F4D4D] ring-2 ring-[#1F4D4D]' : 'border-stone-200 hover:border-stone-400')}
                >
                  {m.kind === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${m.url}?w=640&v=${m.version}`} alt={m.alt} className="aspect-square w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex aspect-square items-center justify-center bg-stone-100 text-sm font-semibold text-stone-500">PDF</div>
                  )}
                  <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                    <p className="truncate text-xs text-stone-700">{m.name}</p>
                    {!m.alt && m.kind === 'image' && <Badge tone="amber">tanpa alt</Badge>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="lg:sticky lg:top-6 lg:self-start">
        {active ? (
          <MediaDetails
            key={`${active.id}-${active.version}`}
            item={active}
            onChanged={(msg, removed) => {
              setNotice({ tone: 'success', text: msg });
              if (removed) setActive(null);
              reload().then(() => undefined);
            }}
            onError={(n) => setNotice(n)}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-stone-300 p-6 text-sm text-stone-500">Klik sebuah file untuk melihat detail, mengubah deskripsi, mengganti, atau menghapusnya.</div>
        )}
      </div>
    </div>
  );
}

function MediaDetails({ item, onChanged, onError }: { item: MediaItem; onChanged: (msg: string, removed?: boolean) => void; onError: (n: Notice) => void }) {
  const [alt, setAlt] = useState(item.alt);
  const [description, setDescription] = useState(item.description);
  const [folder, setFolder] = useState(item.folder);
  const [busy, setBusy] = useState<string | null>(null);
  const [usage, setUsage] = useState<string[] | null>(null);
  const replaceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/admin/media/${item.id}`)
      .then((r) => r.json())
      .then((j) => setUsage(j.usage ?? []))
      .catch(() => setUsage([]));
  }, [item.id]);

  async function save() {
    setBusy('save');
    const res = await fetch(`/api/admin/media/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alt, description, folder }) });
    setBusy(null);
    if (res.ok) onChanged('Detail file disimpan.');
    else onError({ tone: 'error', text: 'Gagal menyimpan.' });
  }
  async function replace(file: File) {
    setBusy('replace');
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`/api/admin/media/${item.id}`, { method: 'PUT', body: fd });
    const j = await res.json().catch(() => ({}));
    setBusy(null);
    if (res.ok) onChanged('File diganti. Semua halaman yang memakai file ini ikut berubah.');
    else onError({ tone: 'error', text: j.error ?? 'Gagal mengganti file.' });
  }
  async function remove() {
    const used = usage && usage.length > 0;
    const msg = used
      ? `File ini MASIH DIPAKAI di:\n- ${usage!.join('\n- ')}\n\nJika dihapus, foto di tempat-tempat tersebut akan hilang. Tetap hapus?`
      : 'Hapus file ini secara permanen?';
    if (!confirmAction(msg)) return;
    setBusy('delete');
    const res = await fetch(`/api/admin/media/${item.id}${used ? '?force=1' : ''}`, { method: 'DELETE' });
    setBusy(null);
    if (res.ok) onChanged('File dihapus.', true);
    else onError({ tone: 'error', text: 'Gagal menghapus file.' });
  }

  return (
    <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      {item.kind === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`${item.url}?w=1280&v=${item.version}`} alt={item.alt} className="w-full rounded-md border border-stone-200" />
      ) : (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="block rounded-md bg-stone-100 p-6 text-center text-sm font-medium underline">
          Buka PDF ↗
        </a>
      )}
      <div className="text-xs text-stone-500">
        <p className="break-all font-medium text-stone-700">{item.name}</p>
        <p>
          {item.width ? `${item.width}×${item.height}px · ` : ''}
          {kb(item.size)}
        </p>
        <p className="mt-1 break-all">
          Alamat: <code className="rounded bg-stone-100 px-1">{item.url}</code>
        </p>
      </div>
      <Field label="Deskripsi foto (alt)" help="Jelaskan isi foto dalam satu kalimat. Penting untuk Google & aksesibilitas.">
        <Input value={alt} onChange={(e) => setAlt(e.target.value)} />
      </Field>
      <Field label="Catatan internal">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[60px]" />
      </Field>
      <Field label="Folder">
        <Input value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="mis. produk" />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" busy={busy === 'save'} onClick={save}>
          Simpan
        </Button>
        <input ref={replaceRef} type="file" className="hidden" accept={item.kind === 'image' ? 'image/*' : 'application/pdf'} onChange={(e) => e.target.files?.[0] && replace(e.target.files[0])} />
        <Button busy={busy === 'replace'} onClick={() => replaceRef.current?.click()}>
          Ganti file
        </Button>
        <Button variant="danger" busy={busy === 'delete'} onClick={remove}>
          Hapus
        </Button>
      </div>
      <div className="text-xs text-stone-600">
        <p className="font-medium">Dipakai di:</p>
        {usage === null ? <p>Memeriksa…</p> : usage.length === 0 ? <p>Tidak dipakai di mana pun.</p> : (
          <ul className="list-disc pl-4">
            {usage.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
