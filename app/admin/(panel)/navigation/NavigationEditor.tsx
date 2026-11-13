'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { SettingsShell } from '@/components/admin/SettingsShell';
import { LinkInput } from '@/components/admin/SchemaForm';
import { Button, Card, Field, Input, Select, Textarea, Toggle, confirmAction } from '@/components/admin/ui';
import type { NavEntry, NavigationData } from '@/lib/settings';

function move<T>(arr: T[], i: number, d: number) {
  const n = [...arr];
  const [x] = n.splice(i, 1);
  n.splice(i + d, 0, x);
  return n;
}

function LinksEditor({ value, onChange, links, label }: { value: { label: string; href: string }[]; onChange: (v: { label: string; href: string }[]) => void; links: string[]; label: string }) {
  return (
    <div className="space-y-2">
      {value.map((l, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input value={l.label} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Tulisan" aria-label={`${label} ${i + 1}: tulisan`} />
          <LinkInput id={`${label}-${i}`} value={l.href} onChange={(href) => onChange(value.map((x, j) => (j === i ? { ...x, href } : x)))} suggestions={links} />
          <div className="flex">
            <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => onChange(move(value, i, -1))} aria-label="Naikkan"><ArrowUp size={14} /></Button>
            <Button size="sm" variant="ghost" disabled={i === value.length - 1} onClick={() => onChange(move(value, i, 1))} aria-label="Turunkan"><ArrowDown size={14} /></Button>
            <Button size="sm" variant="ghost" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Hapus"><Trash2 size={14} /></Button>
          </div>
        </div>
      ))}
      <Button size="sm" onClick={() => onChange([...value, { label: '', href: '/' }])}><Plus size={14} /> Tambah tautan</Button>
    </div>
  );
}

export function NavigationEditor({ initial, hasChanges, links }: { initial: NavigationData; hasChanges: boolean; links: string[] }) {
  return (
    <SettingsShell<NavigationData> settingKey="navigation" title="Menu & footer" description="Isi, urutan dan tulisan menu atas, tombol utama, dan footer." initial={initial} hasChanges={hasChanges}>
      {(nav, set) => {
        const setItem = (i: number, item: NavEntry) => set({ ...nav, items: nav.items.map((x, j) => (j === i ? item : x)) });
        return (
          <div className="space-y-5">
            <Card title="Menu atas" description='Jenis "Daftar sub-brand" otomatis berisi semua lini yang tampil.'>
              <ul className="space-y-3">
                {nav.items.map((item, i) => (
                  <li key={i} className="space-y-2 rounded-lg border border-stone-200 p-3" data-testid="nav-item">
                    <div className="grid gap-2 sm:grid-cols-[170px_1fr_1fr_auto]">
                      <Select
                        value={item.kind}
                        onChange={(e) => {
                          const kind = e.target.value;
                          setItem(i, kind === 'link' ? { kind: 'link', label: item.label, href: '/' } : kind === 'subBrands' ? { kind: 'subBrands', label: item.label } : { kind: 'dropdown', label: item.label, children: [] });
                        }}
                        aria-label={`Menu ${i + 1}: jenis`}
                      >
                        <option value="link">Tautan</option>
                        <option value="dropdown">Menu turun (dropdown)</option>
                        <option value="subBrands">Daftar sub-brand</option>
                      </Select>
                      <Input value={item.label} onChange={(e) => setItem(i, { ...item, label: e.target.value })} placeholder="Tulisan menu" aria-label={`Menu ${i + 1}: tulisan`} />
                      {item.kind === 'link' ? (
                        <LinkInput id={`nav-${i}`} value={item.href} onChange={(href) => setItem(i, { ...item, href })} suggestions={links} />
                      ) : (
                        <span className="self-center text-xs text-stone-500">{item.kind === 'subBrands' ? 'Berisi semua sub-brand' : `${item.children.length} tautan di bawah`}</span>
                      )}
                      <div className="flex">
                        <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => set({ ...nav, items: move(nav.items, i, -1) })} aria-label="Naikkan menu"><ArrowUp size={14} /></Button>
                        <Button size="sm" variant="ghost" disabled={i === nav.items.length - 1} onClick={() => set({ ...nav, items: move(nav.items, i, 1) })} aria-label="Turunkan menu"><ArrowDown size={14} /></Button>
                        <Button size="sm" variant="ghost" onClick={() => confirmAction(`Hapus menu "${item.label}"?`) && set({ ...nav, items: nav.items.filter((_, j) => j !== i) })} aria-label="Hapus menu"><Trash2 size={14} /></Button>
                      </div>
                    </div>
                    {item.kind === 'dropdown' && (
                      <div className="ml-4 border-l-2 border-stone-200 pl-3">
                        <LinksEditor label={`Dropdown ${i + 1}`} value={item.children} onChange={(children) => setItem(i, { ...item, children })} links={links} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <Button className="mt-3" size="sm" onClick={() => set({ ...nav, items: [...nav.items, { kind: 'link', label: 'Menu baru', href: '/' }] })}><Plus size={14} /> Tambah menu</Button>
            </Card>

            <Card title="Tombol utama di menu">
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <Input value={nav.cta.label} onChange={(e) => set({ ...nav, cta: { ...nav.cta, label: e.target.value } })} aria-label="Tulisan tombol utama" />
                <LinkInput id="nav-cta" value={nav.cta.href} onChange={(href) => set({ ...nav, cta: { ...nav.cta, href } })} suggestions={links} />
                <Toggle checked={nav.cta.show} onChange={(show) => set({ ...nav, cta: { ...nav.cta, show } })} label="Tampilkan" />
              </div>
            </Card>

            <Card title="Footer">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Judul kolom sub-brand" htmlFor="f1"><Input id="f1" value={nav.footer.colSubBrand} onChange={(e) => set({ ...nav, footer: { ...nav.footer, colSubBrand: e.target.value } })} /></Field>
                <Field label="Judul kolom tautan" htmlFor="f2"><Input id="f2" value={nav.footer.colExplore} onChange={(e) => set({ ...nav, footer: { ...nav.footer, colExplore: e.target.value } })} /></Field>
                <Field label="Judul kolom kontak" htmlFor="f3"><Input id="f3" value={nav.footer.colContact} onChange={(e) => set({ ...nav, footer: { ...nav.footer, colContact: e.target.value } })} /></Field>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Tautan footer</p>
                <LinksEditor label="Footer" value={nav.footer.exploreLinks} onChange={(exploreLinks) => set({ ...nav, footer: { ...nav.footer, exploreLinks } })} links={links} />
              </div>
              <div className="mt-4 space-y-3">
                <Field label="Kalimat bawah footer" htmlFor="f-note"><Textarea id="f-note" value={nav.footer.note} onChange={(e) => set({ ...nav, footer: { ...nav.footer, note: e.target.value } })} rows={2} /></Field>
                <div className="flex flex-wrap gap-6">
                  <Toggle checked={nav.footer.showSubBrands} onChange={(v) => set({ ...nav, footer: { ...nav.footer, showSubBrands: v } })} label="Tampilkan kolom sub-brand" />
                  <Toggle checked={nav.footer.showSocials} onChange={(v) => set({ ...nav, footer: { ...nav.footer, showSocials: v } })} label="Tampilkan media sosial" />
                </div>
                <p className="text-xs text-stone-500">Kontak, alamat & media sosial di footer diambil dari <a className="underline" href="/admin/settings">Pengaturan situs</a>.</p>
              </div>
            </Card>
          </div>
        );
      }}
    </SettingsShell>
  );
}
