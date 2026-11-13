'use client';

import { SettingsShell } from '@/components/admin/SettingsShell';
import { Card, Field, Input, Textarea, Toggle } from '@/components/admin/ui';
import { ImageField } from '@/components/admin/media';
import type { ChannelKey, SiteSettingsData } from '@/lib/settings';
import { DEFAULT_SUBBRAND_LABELS } from '@/lib/siteText';

const CHANNELS: { key: ChannelKey; name: string; urlHelp?: string }[] = [
  { key: 'whatsapp', name: 'WhatsApp', urlHelp: 'Memakai nomor WhatsApp di atas.' },
  { key: 'shopee', name: 'Shopee' },
  { key: 'tiktok', name: 'TikTok Shop' },
  { key: 'gofood', name: 'GoFood' },
  { key: 'grab', name: 'GrabFood' },
];

const LABELS: Record<keyof typeof DEFAULT_SUBBRAND_LABELS, string> = {
  aboutEyebrow: 'Label kecil “Tentang”',
  aboutTitle: 'Judul “Tentang”',
  productsEyebrow: 'Label kecil “Produk”',
  productsTitle: 'Judul “Produk”',
  orderTitle: 'Judul “Cara memesan”',
  faqEyebrow: 'Label kecil “FAQ”',
  faqTitle: 'Judul “FAQ”',
  crossSell: 'Judul “Lini lain”',
};

export function SiteSettingsEditor({ initial, hasChanges }: { initial: SiteSettingsData; hasChanges: boolean }) {
  return (
    <SettingsShell<SiteSettingsData> settingKey="site" title="Pengaturan situs" description="Identitas, logo, kontak, WhatsApp, kanal belanja, media sosial, dan SEO bawaan." initial={initial} hasChanges={hasChanges}>
      {(s, set) => {
        const text = (key: keyof SiteSettingsData, label: string, opts: { help?: string; area?: boolean; placeholder?: string } = {}) => (
          <Field label={label} help={opts.help} htmlFor={`s-${String(key)}`}>
            {opts.area ? (
              <Textarea id={`s-${String(key)}`} value={(s[key] as string) ?? ''} onChange={(e) => set({ ...s, [key]: e.target.value })} rows={2} placeholder={opts.placeholder} />
            ) : (
              <Input id={`s-${String(key)}`} value={(s[key] as string) ?? ''} onChange={(e) => set({ ...s, [key]: e.target.value })} placeholder={opts.placeholder} />
            )}
          </Field>
        );
        return (
          <div className="space-y-5">
            <Card title="Identitas">
              <div className="grid gap-4 sm:grid-cols-2">
                {text('siteName', 'Nama website')}
                {text('tagline', 'Tagline')}
                {text('brandLineEn', 'Kalimat brand (Inggris)')}
                {text('hashtag', 'Tagar')}
              </div>
              <div className="mt-4 space-y-4">
                {text('description', 'Deskripsi singkat situs', { area: true, help: 'Tampil di footer dan dipakai sebagai deskripsi bawaan.' })}
                {text('organizationDescription', 'Siapa DAMA KITCHEN (paragraf faktual)', { area: true, help: 'Dipakai di halaman Tanya Jawab, data terstruktur (Google), dan llms.txt untuk asisten AI. Tulis fakta, tanpa superlatif.' })}
              </div>
            </Card>
            <Card title="Logo & ikon">
              <div className="grid gap-6 sm:grid-cols-2">
                <ImageField label="Logo (header, latar terang)" value={s.logo} onChange={(logo) => set({ ...s, logo })} />
                <ImageField label="Logo versi terang (footer gelap)" value={s.logoLight} onChange={(logoLight) => set({ ...s, logoLight })} />
                <ImageField label="Monogram (header saat digulir)" value={s.monogram} onChange={(monogram) => set({ ...s, monogram })} />
                <ImageField label="Gambar bawaan saat dibagikan (1200×630)" value={s.ogImage} onChange={(ogImage) => set({ ...s, ogImage })} />
              </div>
              <p className="mt-3 text-xs text-stone-500">Kosongkan logo untuk memakai logo tulisan bawaan DAMA. Favicon memakai ikon bawaan.</p>
            </Card>
            <Card title="Kontak & WhatsApp">
              <div className="grid gap-4 sm:grid-cols-2">
                {text('whatsappNumber', 'Nomor WhatsApp', { help: 'Format internasional tanpa +, mis. 6281181207201', placeholder: '62812…' })}
                {text('email', 'Email')}
                {text('phone', 'Telepon (opsional)')}
                {text('operatingHours', 'Jam operasional', { placeholder: 'mis. Senin–Sabtu, 08.00–17.00' })}
              </div>
              <div className="mt-4 space-y-4">
                {text('whatsappMessage', 'Pesan pembuka WhatsApp', { area: true })}
                {text('address', 'Alamat (opsional)', { area: true })}
                {text('serviceArea', 'Area layanan', { area: true })}
              </div>
            </Card>
            <Card title="Kanal belanja" description="Matikan kanal yang belum tersedia; tombolnya hilang dari seluruh website.">
              <ul className="space-y-3">
                {CHANNELS.map((c) => (
                  <li key={c.key} className="grid gap-2 rounded-md border border-stone-200 p-3 sm:grid-cols-[140px_1fr_1.4fr]">
                    <Toggle checked={s.channels[c.key].enabled} onChange={(enabled) => set({ ...s, channels: { ...s.channels, [c.key]: { ...s.channels[c.key], enabled } } })} label={c.name} />
                    <Input value={s.channels[c.key].label} onChange={(e) => set({ ...s, channels: { ...s.channels, [c.key]: { ...s.channels[c.key], label: e.target.value } } })} aria-label={`${c.name}: tulisan tombol`} />
                    {c.key === 'whatsapp' ? (
                      <p className="self-center text-xs text-stone-500">{c.urlHelp}</p>
                    ) : (
                      <Input value={s.channels[c.key].url} onChange={(e) => set({ ...s, channels: { ...s.channels, [c.key]: { ...s.channels[c.key], url: e.target.value } } })} placeholder="https://…" aria-label={`${c.name}: tautan toko`} />
                    )}
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Media sosial">
              <div className="grid gap-4 sm:grid-cols-2">
                {text('instagram', 'Instagram (URL)')}
                {text('tiktok', 'TikTok (URL)')}
                {text('threads', 'Threads (URL)')}
                {text('facebook', 'Facebook (URL)')}
                {text('youtube', 'YouTube (URL)')}
              </div>
            </Card>
            <Card title="Mesin pencari & asisten AI">
              <Toggle checked={s.allowAiTraining} onChange={(allowAiTraining) => set({ ...s, allowAiTraining })} label="Izinkan crawler pelatihan AI (GPTBot, ClaudeBot, Google-Extended, CCBot…)" />
              <p className="mt-2 text-xs text-stone-500">Crawler mesin pencari dan asisten AI yang mencari jawaban (Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, Claude-SearchBot) selalu diizinkan. Pengaturan ini hanya untuk crawler yang mengumpulkan data pelatihan model AI.</p>
            </Card>
            <Card title="SEO bawaan (Beranda)">
              <div className="space-y-4">
                {text('seoTitle', 'Judul SEO beranda')}
                {text('seoDescription', 'Deskripsi SEO beranda', { area: true })}
              </div>
            </Card>
            <Card title="Banner perayaan" description='Tampil di halaman yang memakai blok "Banner perayaan".'>
              <Toggle checked={s.seasonal.active} onChange={(active) => set({ ...s, seasonal: { ...s.seasonal, active } })} label="Aktifkan banner" />
              <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
                <Field label="Label" htmlFor="sea-label"><Input id="sea-label" value={s.seasonal.label} onChange={(e) => set({ ...s, seasonal: { ...s.seasonal, label: e.target.value } })} /></Field>
                <Field label="Pesan" htmlFor="sea-msg"><Input id="sea-msg" value={s.seasonal.message} onChange={(e) => set({ ...s, seasonal: { ...s.seasonal, message: e.target.value } })} /></Field>
              </div>
            </Card>
            <Card title="Teks halaman lini (sub-brand)" description="Tulis {nama} untuk menyisipkan nama lini.">
              <div className="grid gap-4 sm:grid-cols-2">
                {(Object.keys(LABELS) as (keyof typeof LABELS)[]).map((k) => (
                  <Field key={k} label={LABELS[k]} htmlFor={`lbl-${k}`}>
                    <Input id={`lbl-${k}`} value={s.subBrandLabels[k]} onChange={(e) => set({ ...s, subBrandLabels: { ...s.subBrandLabels, [k]: e.target.value } })} />
                  </Field>
                ))}
              </div>
            </Card>
          </div>
        );
      }}
    </SettingsShell>
  );
}
