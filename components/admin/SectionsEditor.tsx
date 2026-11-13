'use client';

import { useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as Icons from 'lucide-react';
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react';
import { SECTION_BY_TYPE, SECTION_DEFS, STYLE_FIELDS, newSection, sectionTitle } from '@/lib/sections/definitions';
import { SchemaFields, type FormContext } from './SchemaForm';
import { Button, confirmAction } from './ui';
import { cn } from '@/lib/utils';

type Section = Record<string, unknown> & { _type: string; _key: string };
const newKey = () => Math.random().toString(36).slice(2, 10);

function SectionIcon({ name, size = 16 }: { name: string; size?: number }) {
  const I = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Square;
  return <I size={size} />;
}

function OutlineItem({
  s,
  index,
  count,
  active,
  onSelect,
  onMove,
  onToggle,
  onDuplicate,
  onDelete,
}: {
  s: Section;
  index: number;
  count: number;
  active: boolean;
  onSelect: () => void;
  onMove: (d: number) => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: s._key });
  const def = SECTION_BY_TYPE[s._type];
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group flex items-center gap-1 rounded-lg border bg-white px-1.5 py-1.5',
        active ? 'border-[#1F4D4D] ring-1 ring-[#1F4D4D]' : 'border-stone-200',
        isDragging && 'z-10 shadow-lg',
        Boolean(s.hidden) && 'opacity-60',
      )}
      data-testid="section-item"
    >
      <button type="button" className="cursor-grab touch-none rounded p-1 text-stone-400 hover:bg-stone-100 active:cursor-grabbing" aria-label={`Seret untuk memindahkan bagian ${index + 1}`} {...attributes} {...listeners}>
        <GripVertical size={16} />
      </button>
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left" aria-current={active}>
        <span className="text-stone-500"><SectionIcon name={def?.icon ?? 'Square'} /></span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-stone-900">{sectionTitle(s)}</span>
          <span className="block truncate text-xs text-stone-500">
            {def?.label ?? s._type}
            {s.hidden ? ' · disembunyikan' : ''}
            {s.device === 'mobile' ? ' · hanya HP' : s.device === 'desktop' ? ' · hanya desktop' : ''}
          </span>
        </span>
      </button>
      <div className="flex shrink-0 items-center">
        <Button size="sm" variant="ghost" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Naikkan bagian"><ArrowUp size={14} /></Button>
        <Button size="sm" variant="ghost" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Turunkan bagian"><ArrowDown size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={onToggle} aria-label={s.hidden ? 'Tampilkan bagian' : 'Sembunyikan bagian'} title={s.hidden ? 'Tampilkan' : 'Sembunyikan'}>
          {s.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDuplicate} aria-label="Gandakan bagian" title="Gandakan"><Copy size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={onDelete} aria-label="Hapus bagian" title="Hapus"><Trash2 size={14} /></Button>
      </div>
    </li>
  );
}

function AddSectionPanel({ onAdd, onClose }: { onAdd: (type: string) => void; onClose: () => void }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-lg" role="dialog" aria-label="Pilih jenis bagian">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">Pilih jenis bagian</p>
        <button type="button" onClick={onClose} className="rounded p-1 text-stone-500 hover:bg-stone-100" aria-label="Tutup">✕</button>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {SECTION_DEFS.map((d) => (
          <li key={d.type}>
            <button type="button" onClick={() => onAdd(d.type)} className="flex w-full items-start gap-3 rounded-lg border border-stone-200 p-3 text-left hover:border-[#1F4D4D] hover:bg-[#1F4D4D]/5">
              <span className="mt-0.5 text-[#1F4D4D]"><SectionIcon name={d.icon} size={18} /></span>
              <span>
                <span className="block text-sm font-medium text-stone-900">{d.label}</span>
                <span className="block text-xs text-stone-500">{d.description}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Visual page builder: outline (add / remove / duplicate / hide / drag &
 * drop reorder) + a generated form for the selected section, split into
 * "Konten" and "Tampilan" (layout, background, spacing, device visibility).
 */
export function SectionsEditor({ sections, onChange, ctx }: { sections: Section[]; onChange: (s: Section[]) => void; ctx: FormContext }) {
  const [activeKey, setActiveKey] = useState<string | null>(sections[0]?._key ?? null);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<'konten' | 'tampilan'>('konten');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const activeIndex = sections.findIndex((s) => s._key === activeKey);
  const active = activeIndex >= 0 ? sections[activeIndex] : null;
  const def = active ? SECTION_BY_TYPE[active._type] : null;
  const update = (i: number, next: Section) => onChange(sections.map((s, j) => (j === i ? next : s)));

  const add = (type: string) => {
    const s = newSection(type, newKey()) as Section;
    const at = activeIndex >= 0 ? activeIndex + 1 : sections.length;
    onChange([...sections.slice(0, at), s, ...sections.slice(at)]);
    setActiveKey(s._key);
    setTab('konten');
    setAdding(false);
  };

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = sections.findIndex((s) => s._key === e.active.id);
    const to = sections.findIndex((s) => s._key === e.over!.id);
    onChange(arrayMove(sections, from, to));
  };

  const contentFields = def?.fields.filter((f) => (f.group ?? 'konten') === 'konten') ?? [];
  const styleFields = def ? [...def.fields.filter((f) => f.group === 'tampilan'), ...(def.styled ? STYLE_FIELDS : [])] : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-800">Susunan halaman ({sections.length} bagian)</p>
          <Button size="sm" variant="primary" onClick={() => setAdding(true)}>
            <Plus size={14} /> Tambah bagian
          </Button>
        </div>
        {adding && <AddSectionPanel onAdd={add} onClose={() => setAdding(false)} />}
        {sections.length === 0 && <p className="rounded-lg border border-dashed border-stone-300 p-4 text-sm text-stone-500">Halaman ini belum punya bagian. Klik “Tambah bagian”.</p>}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={sections.map((s) => s._key)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2" aria-label="Bagian halaman">
              {sections.map((s, i) => (
                <OutlineItem
                  key={s._key}
                  s={s}
                  index={i}
                  count={sections.length}
                  active={s._key === activeKey}
                  onSelect={() => setActiveKey(s._key)}
                  onMove={(d) => onChange(arrayMove(sections, i, i + d))}
                  onToggle={() => update(i, { ...s, hidden: !s.hidden })}
                  onDuplicate={() => {
                    const copy = { ...structuredClone(s), _key: newKey() } as Section;
                    onChange([...sections.slice(0, i + 1), copy, ...sections.slice(i + 1)]);
                    setActiveKey(copy._key);
                  }}
                  onDelete={() => {
                    if (!confirmAction(`Hapus bagian "${sectionTitle(s)}"? (Bisa dibatalkan dengan "Batalkan perubahan" selama belum diterbitkan.)`)) return;
                    onChange(sections.filter((_, j) => j !== i));
                    if (s._key === activeKey) setActiveKey(sections[i + 1]?._key ?? sections[i - 1]?._key ?? null);
                  }}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      <div className="min-w-0">
        {active && def ? (
          <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[#1F4D4D]"><SectionIcon name={def.icon} size={18} /></span>
                <h3 className="text-sm font-semibold">{def.label}</h3>
              </div>
              <div className="flex rounded-md border border-stone-300 p-0.5 text-sm" role="tablist">
                {(['konten', 'tampilan'] as const).map((t) => (
                  <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('rounded px-3 py-1', tab === t ? 'bg-[#1F4D4D] text-white' : 'text-stone-700 hover:bg-stone-100')}>
                    {t === 'konten' ? 'Konten' : 'Tampilan'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4 p-4">
              {tab === 'konten' ? (
                contentFields.length ? (
                  <SchemaFields fields={contentFields} value={active} onChange={(v) => update(activeIndex, v as Section)} ctx={ctx} path={`s-${active._key}`} />
                ) : (
                  <p className="text-sm text-stone-500">Bagian ini tidak punya isi untuk diubah. Lihat tab Tampilan.</p>
                )
              ) : styleFields.length ? (
                <SchemaFields fields={styleFields} value={active} onChange={(v) => update(activeIndex, v as Section)} ctx={ctx} path={`s-${active._key}`} />
              ) : (
                <p className="text-sm text-stone-500">Tidak ada pengaturan tampilan untuk bagian ini.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">Pilih bagian di kiri untuk mengubah isinya.</div>
        )}
      </div>
    </div>
  );
}
