'use client';

import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CHANNEL_OPTIONS, LINK_HELP, type FieldDef, type Option } from '@/lib/sections/definitions';
import type { ImageValue } from '@/lib/text';
import { Button, Field, Input, Select, Textarea, Toggle, confirmAction } from './ui';
import { GalleryField, ImageField } from './media';
import { RichTextEditor } from './RichTextEditor';
import { cn } from '@/lib/utils';

/**
 * Generates an editing form from field definitions (lib/sections/definitions.ts).
 * Every control maps to a typed field — editors never touch JSON or code.
 */

export interface FormContext {
  subBrandOptions: Option[];
  linkSuggestions: string[];
}

const newKey = () => Math.random().toString(36).slice(2, 10);

export function LinkInput({ value, onChange, id, suggestions }: { value: string; onChange: (v: string) => void; id?: string; suggestions: string[] }) {
  const listId = `${id ?? 'link'}-suggest`;
  const valid = !value || value === 'whatsapp' || /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/.test(value);
  return (
    <div>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} list={listId} placeholder="/pesan · https://… · whatsapp" className={cn(!valid && 'border-red-400')} />
      <datalist id={listId}>
        <option value="whatsapp">Chat WhatsApp DAMA</option>
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      {!valid && <p className="mt-1 text-xs text-red-700">Tautan harus diawali “/”, “https://”, “#”, “mailto:”, “tel:” atau tulis “whatsapp”.</p>}
    </div>
  );
}

function moveItem<T>(arr: T[], i: number, d: number): T[] {
  const next = [...arr];
  const [x] = next.splice(i, 1);
  next.splice(i + d, 0, x);
  return next;
}

type Obj = Record<string, unknown>;

function ListField({ f, value, onChange, ctx, path }: { f: FieldDef; value: Obj[]; onChange: (v: Obj[]) => void; ctx: FormContext; path: string }) {
  const [open, setOpen] = useState<string | null>(value[0]?._key as string | null);
  const max = f.max ?? 50;
  const titleOf = (it: Obj) => (it.title || it.heading || it.q || it.label || '') as string;
  const add = () => {
    const item: Obj = { _key: newKey() };
    for (const sub of f.fields ?? []) if (sub.default !== undefined) item[sub.name] = sub.default;
    onChange([...value, item]);
    setOpen(item._key as string);
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-800">{f.label}</p>
        <Button size="sm" onClick={add} disabled={value.length >= max}>
          <Plus size={14} /> Tambah {f.itemLabel?.toLowerCase() ?? 'item'}
        </Button>
      </div>
      {value.length === 0 && <p className="text-xs text-stone-500">Belum ada {f.itemLabel?.toLowerCase() ?? 'item'}.</p>}
      <ul className="space-y-2">
        {value.map((it, i) => {
          const k = (it._key as string) ?? String(i);
          const isOpen = open === k;
          return (
            <li key={k} className="rounded-md border border-stone-200 bg-stone-50/60">
              <div className="flex items-center gap-1 px-2 py-1.5">
                <button type="button" onClick={() => setOpen(isOpen ? null : k)} className="flex-1 truncate py-1 text-left text-sm font-medium text-stone-800" aria-expanded={isOpen}>
                  {i + 1}. {titleOf(it) || `${f.itemLabel ?? 'Item'} tanpa judul`}
                </button>
                <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => onChange(moveItem(value, i, -1))} aria-label="Naikkan"><ArrowUp size={14} /></Button>
                <Button size="sm" variant="ghost" disabled={i === value.length - 1} onClick={() => onChange(moveItem(value, i, 1))} aria-label="Turunkan"><ArrowDown size={14} /></Button>
                <Button size="sm" variant="ghost" disabled={value.length >= max} onClick={() => onChange([...value.slice(0, i + 1), { ...it, _key: newKey() }, ...value.slice(i + 1)])} aria-label="Gandakan"><Copy size={14} /></Button>
                <Button size="sm" variant="ghost" onClick={() => confirmAction(`Hapus ${f.itemLabel?.toLowerCase() ?? 'item'} ini?`) && onChange(value.filter((_, j) => j !== i))} aria-label="Hapus"><Trash2 size={14} /></Button>
              </div>
              {isOpen && (
                <div className="space-y-3 border-t border-stone-200 bg-white p-3">
                  <SchemaFields fields={f.fields ?? []} value={it} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} ctx={ctx} path={`${path}-${k}`} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ButtonsField({ f, value, onChange, ctx, path }: { f: FieldDef; value: Obj[]; onChange: (v: Obj[]) => void; ctx: FormContext; path: string }) {
  const max = f.max ?? 3;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-800">{f.label}</p>
        <Button size="sm" disabled={value.length >= max} onClick={() => onChange([...value, { _key: newKey(), label: 'Tombol', link: '/pesan', style: 'primary' }])}>
          <Plus size={14} /> Tambah tombol
        </Button>
      </div>
      {value.map((b, i) => (
        <div key={(b._key as string) ?? i} className="grid gap-2 rounded-md border border-stone-200 p-2 sm:grid-cols-[1fr_1fr_140px_auto]">
          <Input value={(b.label as string) ?? ''} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Tulisan tombol" aria-label={`Tombol ${i + 1}: tulisan`} />
          <LinkInput id={`${path}-btn-${i}`} value={(b.link as string) ?? ''} onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, link: v } : x)))} suggestions={ctx.linkSuggestions} />
          <Select value={(b.style as string) ?? 'primary'} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, style: e.target.value } : x)))} aria-label={`Tombol ${i + 1}: gaya`}>
            <option value="primary">Utama (berwarna)</option>
            <option value="secondary">Garis (outline)</option>
          </Select>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => onChange(moveItem(value, i, -1))} aria-label="Naikkan"><ArrowUp size={14} /></Button>
            <Button size="sm" variant="ghost" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Hapus tombol"><Trash2 size={14} /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SchemaField({ f, value, onChange, ctx, path }: { f: FieldDef; value: unknown; onChange: (v: unknown) => void; ctx: FormContext; path: string }) {
  const id = `${path}-${f.name}`;
  switch (f.type) {
    case 'text':
      return (
        <Field label={f.label} help={f.help} htmlFor={id}>
          <Input id={id} value={(value as string) ?? ''} maxLength={f.max} onChange={(e) => onChange(e.target.value)} required={f.required} />
        </Field>
      );
    case 'textarea':
      return (
        <Field label={f.label} help={f.help} htmlFor={id}>
          <Textarea id={id} value={(value as string) ?? ''} maxLength={f.max} onChange={(e) => onChange(e.target.value)} rows={4} />
        </Field>
      );
    case 'richtext':
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-stone-800">{f.label}</p>
          <RichTextEditor value={(value as string) ?? ''} onChange={onChange} label={f.label} />
        </div>
      );
    case 'link':
      return (
        <Field label={f.label} help={f.help ?? LINK_HELP} htmlFor={id}>
          <LinkInput id={id} value={(value as string) ?? ''} onChange={onChange} suggestions={ctx.linkSuggestions} />
        </Field>
      );
    case 'number':
      return (
        <Field label={f.label} help={f.help} htmlFor={id}>
          <Input id={id} type="number" min={f.min} max={f.max} value={value === undefined || value === null ? '' : String(value)} onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))} className="max-w-[160px]" />
        </Field>
      );
    case 'boolean':
      return <Toggle id={id} checked={value === true} onChange={onChange} label={f.label} />;
    case 'select': {
      const options = f.optionsFrom === 'subBrands' ? ctx.subBrandOptions : f.options ?? [];
      return (
        <Field label={f.label} help={f.help} htmlFor={id}>
          <Select id={id} value={(value as string) ?? (f.default as string) ?? ''} onChange={(e) => onChange(e.target.value)}>
            {!f.required && f.default === undefined && <option value="">— pilih —</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      );
    }
    case 'channels': {
      const v = (value as string[]) ?? [];
      return (
        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium text-stone-800">{f.label}</legend>
          <div className="flex flex-wrap gap-3">
            {CHANNEL_OPTIONS.map((o) => (
              <label key={o.value} className="inline-flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={v.includes(o.value)} onChange={(e) => onChange(e.target.checked ? [...v, o.value] : v.filter((x) => x !== o.value))} />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      );
    }
    case 'image':
      return <ImageField label={f.label} value={value as ImageValue | undefined} onChange={onChange} />;
    case 'images':
      return <GalleryField label={f.label} value={(value as (ImageValue & { _key?: string })[]) ?? []} onChange={onChange} />;
    case 'buttons':
      return <ButtonsField f={f} value={(value as Obj[]) ?? []} onChange={onChange} ctx={ctx} path={id} />;
    case 'list':
      return <ListField f={f} value={(value as Obj[]) ?? []} onChange={onChange} ctx={ctx} path={id} />;
  }
}

export function SchemaFields({ fields, value, onChange, ctx, path }: { fields: FieldDef[]; value: Obj; onChange: (v: Obj) => void; ctx: FormContext; path: string }) {
  return (
    <>
      {fields
        .filter((f) => !f.showIf || f.showIf.equals.includes(String(value[f.showIf.field] ?? '')))
        .map((f) => (
          <SchemaField key={f.name} f={f} value={value[f.name]} onChange={(v) => onChange({ ...value, [f.name]: v })} ctx={ctx} path={path} />
        ))}
    </>
  );
}
