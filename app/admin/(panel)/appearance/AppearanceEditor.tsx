'use client';

import { resetThemeDraft } from '@/app/admin/actions/settings';
import { SettingsShell } from '@/components/admin/SettingsShell';
import { Button, Card, Field, Input, Select, Toggle, confirmAction } from '@/components/admin/ui';
import { BODY_FONTS, BRAND_PALETTE, HEADING_FONTS, type ThemeData } from '@/lib/settings';
import { contrastRatio, parseHex, type ThemeBase } from '@/lib/theme';

const COLORS: { key: ThemeBase; label: string; help: string }[] = [
  { key: 'primary', label: 'Warna utama', help: 'Judul, menu, footer, latar gelap (asli: Deep Teal)' },
  { key: 'accent', label: 'Warna kedua', help: 'Tombol “Pesan” & sorotan (asli: Terracotta)' },
  { key: 'highlight', label: 'Warna aksen', help: 'Aksen kecil, label (asli: Gold)' },
  { key: 'background', label: 'Warna latar', help: 'Latar halaman (asli: Cream)' },
  { key: 'text', label: 'Warna teks', help: 'Teks isi (asli: Deep Brown)' },
  { key: 'soft', label: 'Warna lembut', help: 'Permukaan lembut / hadiah (asli: Blush Rose)' },
  { key: 'festive', label: 'Warna perayaan', help: 'Hanya untuk banner perayaan' },
];

function contrastWarnings(c: ThemeData['colors']): string[] {
  const out: string[] = [];
  const check = (a: string, b: string, min: number, msg: string) => {
    const r = contrastRatio(a, b);
    if (r !== null && r < min) out.push(`${msg} (kontras ${r.toFixed(1)}:1, minimal ${min}:1)`);
  };
  check(c.text, c.background, 4.5, 'Teks sulit dibaca di atas warna latar');
  check(c.primary, c.background, 3, 'Judul (warna utama) kurang kontras dengan latar');
  check('#FFFFFF', c.accent, 3, 'Tulisan putih di tombol (warna kedua) sulit dibaca');
  check(c.background, c.primary, 4.5, 'Teks terang di atas warna utama (footer) sulit dibaca');
  return out;
}

export function AppearanceEditor({ initial, hasChanges }: { initial: ThemeData; hasChanges: boolean }) {
  return (
    <SettingsShell<ThemeData>
      settingKey="theme"
      title="Tampilan & warna"
      description="Warna, huruf, bentuk tombol, sudut, jarak dan lebar konten untuk seluruh website. Ubah, klik Pratinjau, lalu Terbitkan."
      initial={initial}
      hasChanges={hasChanges}
      extraActions={({ setValue, run }) => (
        <Button onClick={async () => {
          if (!confirmAction('Kembalikan semua pengaturan tampilan ke warna & gaya asli DAMA? (Tersimpan sebagai draf.)')) return;
          const res = await run('reset', () => resetThemeDraft());
          if (res.ok && res.data) setValue(res.data as ThemeData);
        }}>Kembalikan ke warna asli DAMA</Button>
      )}
    >
      {(t, set) => {
        const warn = contrastWarnings(t.colors);
        const setColor = (k: ThemeBase, v: string) => set({ ...t, colors: { ...t.colors, [k]: v } });
        return (
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <Card title="Warna" description="Setiap warna dasar otomatis membuat versi terang/gelapnya sendiri.">
                <div className="grid gap-4 sm:grid-cols-2">
                  {COLORS.map((c) => (
                    <Field key={c.key} label={c.label} help={c.help} htmlFor={`color-${c.key}`}>
                      <div className="flex items-center gap-2">
                        <input type="color" value={parseHex(t.colors[c.key]) ? t.colors[c.key] : BRAND_PALETTE[c.key]} onChange={(e) => setColor(c.key, e.target.value.toUpperCase())} className="h-10 w-14 cursor-pointer rounded border border-stone-300" aria-label={`Pilih ${c.label}`} />
                        <Input id={`color-${c.key}`} value={t.colors[c.key]} onChange={(e) => setColor(c.key, e.target.value)} className="max-w-[130px] font-mono" />
                        {t.colors[c.key].toUpperCase() !== BRAND_PALETTE[c.key].toUpperCase() && (
                          <button type="button" className="text-xs text-stone-500 underline" onClick={() => setColor(c.key, BRAND_PALETTE[c.key])}>asli</button>
                        )}
                      </div>
                    </Field>
                  ))}
                </div>
                {warn.length > 0 && (
                  <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="alert">
                    <p className="font-medium">Perhatian keterbacaan:</p>
                    <ul className="list-disc pl-5">{warn.map((w) => <li key={w}>{w}</li>)}</ul>
                  </div>
                )}
              </Card>
              <Card title="Huruf (font)">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Huruf judul" htmlFor="f-heading">
                    <Select id="f-heading" value={t.headingFont} onChange={(e) => set({ ...t, headingFont: e.target.value })}>
                      {HEADING_FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </Select>
                  </Field>
                  <Field label="Huruf isi" htmlFor="f-body">
                    <Select id="f-body" value={t.bodyFont} onChange={(e) => set({ ...t, bodyFont: e.target.value })}>
                      {BODY_FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </Select>
                  </Field>
                </div>
              </Card>
              <Card title="Bentuk & tata letak">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Bentuk tombol" htmlFor="btn-shape">
                    <Select id="btn-shape" value={t.buttonShape} onChange={(e) => set({ ...t, buttonShape: e.target.value as ThemeData['buttonShape'] })}>
                      <option value="rounded">Sudut membulat</option>
                      <option value="pill">Kapsul (bulat penuh)</option>
                      <option value="square">Kotak</option>
                    </Select>
                  </Field>
                  <Field label="Sudut kartu & foto" htmlFor="radius">
                    <Select id="radius" value={t.radius} onChange={(e) => set({ ...t, radius: e.target.value as ThemeData['radius'] })}>
                      <option value="none">Tajam</option>
                      <option value="small">Sedikit membulat</option>
                      <option value="medium">Membulat (asli)</option>
                      <option value="large">Sangat membulat</option>
                    </Select>
                  </Field>
                  <Field label="Jarak antar bagian" htmlFor="spacing">
                    <Select id="spacing" value={t.sectionSpacing} onChange={(e) => set({ ...t, sectionSpacing: e.target.value as ThemeData['sectionSpacing'] })}>
                      <option value="compact">Rapat</option>
                      <option value="normal">Normal (asli)</option>
                      <option value="spacious">Lega</option>
                    </Select>
                  </Field>
                  <Field label="Lebar konten" htmlFor="width">
                    <Select id="width" value={t.containerWidth} onChange={(e) => set({ ...t, containerWidth: e.target.value as ThemeData['containerWidth'] })}>
                      <option value="narrow">Sempit (1040px)</option>
                      <option value="normal">Normal (1200px, asli)</option>
                      <option value="wide">Lebar (1360px)</option>
                    </Select>
                  </Field>
                </div>
              </Card>
              <Card title="Header & footer">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Gaya header" htmlFor="header">
                    <Select id="header" value={t.headerStyle} onChange={(e) => set({ ...t, headerStyle: e.target.value as ThemeData['headerStyle'] })}>
                      <option value="light">Terang (krem, asli)</option>
                      <option value="dark">Gelap (warna utama)</option>
                    </Select>
                  </Field>
                  <Field label="Gaya footer" htmlFor="footer">
                    <Select id="footer" value={t.footerStyle} onChange={(e) => set({ ...t, footerStyle: e.target.value as ThemeData['footerStyle'] })}>
                      <option value="dark">Gelap (warna utama, asli)</option>
                      <option value="light">Terang (krem)</option>
                    </Select>
                  </Field>
                </div>
                <div className="mt-4">
                  <Toggle checked={t.headerSticky} onChange={(v) => set({ ...t, headerSticky: v })} label="Header tetap terlihat saat halaman digulir" />
                </div>
              </Card>
            </div>
            <div className="lg:sticky lg:top-6 lg:self-start">
              <Card title="Contoh tampilan">
                <div className="overflow-hidden rounded-lg border border-stone-200" style={{ backgroundColor: t.colors.background }}>
                  <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: t.headerStyle === 'dark' ? t.colors.primary : t.colors.background }}>
                    <span className="text-sm font-semibold tracking-widest" style={{ color: t.headerStyle === 'dark' ? t.colors.background : t.colors.primary }}>DAMA</span>
                    <span className="px-3 py-1 text-xs text-white" style={{ backgroundColor: t.colors.accent, borderRadius: t.buttonShape === 'pill' ? 999 : t.buttonShape === 'square' ? 0 : 8 }}>Pesan</span>
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: t.colors.accent }}>Taraso Disayang</p>
                    <p className="text-xl" style={{ color: t.colors.primary, fontFamily: 'Georgia, serif' }}>Masakan Minang otentik</p>
                    <p className="text-sm" style={{ color: t.colors.text }}>Dimasak perlahan dan penuh perhatian, untuk yang disayang.</p>
                    <div className="flex gap-2 pt-2">
                      <span className="px-3 py-1.5 text-xs text-white" style={{ backgroundColor: t.colors.accent, borderRadius: t.buttonShape === 'pill' ? 999 : t.buttonShape === 'square' ? 0 : 8 }}>Tombol utama</span>
                      <span className="border px-3 py-1.5 text-xs" style={{ color: t.colors.primary, borderColor: t.colors.primary, borderRadius: t.buttonShape === 'pill' ? 999 : t.buttonShape === 'square' ? 0 : 8 }}>Tombol garis</span>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      {(['primary', 'accent', 'highlight', 'soft', 'text'] as ThemeBase[]).map((k) => (
                        <span key={k} className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: t.colors[k] }} title={k} />
                      ))}
                    </div>
                  </div>
                  <div className="px-4 py-3 text-xs" style={{ backgroundColor: t.footerStyle === 'dark' ? t.colors.primary : t.colors.soft, color: t.footerStyle === 'dark' ? t.colors.background : t.colors.text }}>Footer · © DAMA KITCHEN</div>
                </div>
                <p className="mt-3 text-xs text-stone-500">Untuk melihat hasil lengkap di semua halaman, klik <strong>Pratinjau</strong>.</p>
              </Card>
            </div>
          </div>
        );
      }}
    </SettingsShell>
  );
}
