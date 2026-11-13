/**
 * Page-builder section library — ONE definition used by:
 *  - the admin editor (forms are generated from these fields), and
 *  - the server validator (lib/sections/validate.ts), which rejects anything
 *    not described here. No raw code/HTML injection is possible: rich text is
 *    sanitized and every other value is a typed, bounded field.
 *
 * Stored section shape: { _type, _key, ...fields }. Images are
 * { url, alt, mediaId?, caption? } where url is a /media/… path or https URL.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'image'
  | 'images'
  | 'select'
  | 'number'
  | 'boolean'
  | 'link'
  | 'buttons'
  | 'list'
  | 'channels';

export interface Option {
  value: string;
  label: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  group?: 'konten' | 'tampilan';
  help?: string;
  required?: boolean;
  max?: number; // text length or list length
  min?: number; // number minimum
  options?: Option[];
  /** Special dynamic option source filled by the admin at runtime. */
  optionsFrom?: 'subBrands';
  default?: unknown;
  /** Only show when another field has one of these values. */
  showIf?: { field: string; equals: string[] };
  /** Item fields for type 'list'. */
  fields?: FieldDef[];
  itemLabel?: string;
}

export interface SectionDef {
  type: string;
  label: string;
  description: string;
  icon: string; // lucide icon name, rendered by the admin
  fields: FieldDef[];
  /** Field used as the section's title in the outline. */
  titleField?: string;
  /** Section supports the shared style/visibility fields. */
  styled?: boolean;
}

// ── Shared fields ─────────────────────────────────────────────
export const LINK_HELP = 'Contoh: /pesan, /menu, https://…, atau ketik "whatsapp" untuk chat WhatsApp.';

const eyebrow: FieldDef = { name: 'eyebrow', label: 'Label kecil di atas judul', type: 'text', max: 120 };
const heading: FieldDef = { name: 'heading', label: 'Judul', type: 'text', max: 200 };
const intro: FieldDef = { name: 'intro', label: 'Pengantar', type: 'textarea', max: 1000 };
const buttons: FieldDef = { name: 'buttons', label: 'Tombol', type: 'buttons', max: 3 };
const image = (label = 'Foto'): FieldDef => ({ name: 'image', label, type: 'image' });

const columns = (initial: number): FieldDef => ({
  name: 'columns',
  label: 'Jumlah kolom (desktop)',
  type: 'select',
  group: 'tampilan',
  options: ['1', '2', '3', '4'].map((v) => ({ value: v, label: v })),
  default: String(initial),
});

const imagePosition = (initial: 'left' | 'right', withNone = false): FieldDef => ({
  name: 'imagePosition',
  label: 'Posisi foto (desktop)',
  type: 'select',
  group: 'tampilan',
  options: [
    { value: 'right', label: 'Kanan' },
    { value: 'left', label: 'Kiri' },
    ...(withNone ? [{ value: 'none', label: 'Tanpa foto' }] : []),
  ],
  default: initial,
});

const mobileImage = (initial: 'after' | 'before'): FieldDef => ({
  name: 'mobileImage',
  label: 'Posisi foto di HP',
  type: 'select',
  group: 'tampilan',
  options: [
    { value: 'after', label: 'Di bawah teks' },
    { value: 'before', label: 'Di atas teks' },
    { value: 'hidden', label: 'Sembunyikan foto di HP' },
  ],
  default: initial,
});

const ratio = (initial = 'landscape'): FieldDef => ({
  name: 'imageRatio',
  label: 'Bentuk foto',
  type: 'select',
  group: 'tampilan',
  options: [
    { value: 'landscape', label: 'Melebar (4:3)' },
    { value: 'square', label: 'Persegi' },
    { value: 'portrait', label: 'Tegak (3:4)' },
    { value: 'wide', label: 'Lebar (16:9)' },
  ],
  default: initial,
});

const align: FieldDef = {
  name: 'align',
  label: 'Perataan teks',
  type: 'select',
  group: 'tampilan',
  options: [
    { value: 'left', label: 'Kiri' },
    { value: 'center', label: 'Tengah' },
  ],
  default: 'left',
};

export const BACKGROUND_OPTIONS: Option[] = [
  { value: 'cream', label: 'Krem (latar utama)' },
  { value: 'paper', label: 'Krem terang' },
  { value: 'deep', label: 'Krem gelap' },
  { value: 'soft', label: 'Lembut (blush)' },
  { value: 'highlight', label: 'Emas muda' },
  { value: 'primary', label: 'Warna utama (gelap)' },
  { value: 'accent', label: 'Warna kedua (terakota)' },
];

export const MOTIF_OPTIONS: Option[] = [
  { value: 'none', label: 'Tanpa motif' },
  { value: 'songket-geometric', label: 'Songket Geometris' },
  { value: 'bunga-floral', label: 'Bunga' },
  { value: 'daun-leaf', label: 'Daun' },
  { value: 'geometric-gold', label: 'Geometris Emas' },
];

/** Style + visibility fields appended to every styled section. */
export const STYLE_FIELDS: FieldDef[] = [
  { name: 'background', label: 'Warna latar bagian', type: 'select', group: 'tampilan', options: BACKGROUND_OPTIONS, default: 'cream', help: 'Mengikuti warna tema. Warna teks menyesuaikan otomatis agar tetap terbaca.' },
  {
    name: 'spacing',
    label: 'Jarak atas-bawah',
    type: 'select',
    group: 'tampilan',
    options: [
      { value: 'compact', label: 'Rapat' },
      { value: 'normal', label: 'Normal' },
      { value: 'spacious', label: 'Lega' },
    ],
    default: 'normal',
  },
  { name: 'motif', label: 'Motif latar', type: 'select', group: 'tampilan', options: MOTIF_OPTIONS, default: 'none' },
  { name: 'motifImage', label: 'Motif kustom (opsional)', type: 'image', group: 'tampilan', help: 'Menggantikan motif di atas. Gunakan pola yang bisa diulang.' },
  { name: 'motifOpacity', label: 'Kepekatan motif (%)', type: 'number', group: 'tampilan', min: 0, max: 12, default: 5 },
  { name: 'dividerAbove', label: 'Garis pemisah (◇) di atas bagian ini', type: 'boolean', group: 'tampilan', default: false },
  {
    name: 'device',
    label: 'Tampil di perangkat',
    type: 'select',
    group: 'tampilan',
    options: [
      { value: 'all', label: 'Semua perangkat' },
      { value: 'desktop', label: 'Hanya desktop/tablet' },
      { value: 'mobile', label: 'Hanya HP' },
    ],
    default: 'all',
  },
  { name: 'anchor', label: 'ID tautan (opsional)', type: 'text', group: 'tampilan', max: 60, help: 'Misal "paket" → bisa ditautkan dengan /hadiah#paket. Huruf kecil, angka, tanda "-".' },
];

export const CHANNEL_OPTIONS: Option[] = [
  { value: 'shopee', label: 'Shopee' },
  { value: 'tiktok', label: 'TikTok Shop' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'gofood', label: 'GoFood' },
  { value: 'grab', label: 'GrabFood' },
];

export const ICON_OPTIONS: Option[] = [
  { value: 'none', label: 'Tanpa ikon' },
  { value: 'recipe', label: 'Resep (buku)' },
  { value: 'care', label: 'Kepedulian (tangan & hati)' },
  { value: 'ingredients', label: 'Bahan (daun)' },
  { value: 'love', label: 'Kasih (mangkuk & hati)' },
  { value: 'panaskan', label: 'Panaskan' },
  { value: 'porsi', label: 'Porsi' },
  { value: 'masa-simpan', label: 'Masa simpan' },
  { value: 'halal', label: 'Halal' },
  { value: 'pedas', label: 'Pedas' },
  { value: 'sambal-terpisah', label: 'Sambal terpisah' },
  { value: 'reusable', label: 'Kemasan ulang pakai' },
  { value: 'kirim-aman', label: 'Kirim aman' },
];

export const DATA_SOURCES: Option[] = [
  { value: 'subBrands', label: 'Kartu lini (sub-brand)' },
  { value: 'pillars', label: 'Pilar brand' },
  { value: 'values', label: 'Nilai brand' },
  { value: 'testimonials', label: 'Testimoni' },
  { value: 'faqs', label: 'Tanya jawab (dari menu FAQ)' },
  { value: 'channels', label: 'Tombol kanal pemesanan' },
  { value: 'channelMatrix', label: 'Panduan kanal per lini (halaman Pesan)' },
  { value: 'menu', label: 'Menu lengkap + filter' },
  { value: 'products', label: 'Produk dari satu lini' },
  { value: 'productGrid', label: 'Produk pilihan / kategori' },
  { value: 'giftTiers', label: 'Paket hampers' },
  { value: 'seasonalBanner', label: 'Banner perayaan (bila aktif)' },
  { value: 'journal', label: 'Artikel Catatan Dapur terbaru' },
  { value: 'contact', label: 'Info kontak & area layanan' },
];

// ── Section types ─────────────────────────────────────────────
export const SECTION_DEFS: SectionDef[] = [
  {
    type: 'heroSection',
    label: 'Hero (pembuka halaman)',
    description: 'Judul besar, teks, tombol dan foto.',
    icon: 'PanelTop',
    styled: true,
    fields: [
      eyebrow,
      { ...heading, required: true },
      { name: 'text', label: 'Teks', type: 'textarea', max: 2000, help: 'Pisahkan paragraf dengan baris kosong.' },
      buttons,
      image(),
      imagePosition('right', true),
      mobileImage('after'),
      ratio('landscape'),
      {
        name: 'headingSize',
        label: 'Ukuran judul',
        type: 'select',
        group: 'tampilan',
        options: [
          { value: 'large', label: 'Besar' },
          { value: 'xlarge', label: 'Sangat besar' },
        ],
        default: 'large',
      },
    ],
  },
  {
    type: 'textSection',
    label: 'Teks',
    description: 'Tulisan bebas: judul, paragraf, poin, kutipan, gambar, tautan.',
    icon: 'Type',
    styled: true,
    fields: [eyebrow, heading, { name: 'body', label: 'Isi', type: 'richtext' }, buttons, align],
  },
  {
    type: 'splitSection',
    label: 'Foto + Teks',
    description: 'Foto di satu sisi, tulisan di sisi lain.',
    icon: 'Columns2',
    styled: true,
    fields: [eyebrow, heading, { name: 'body', label: 'Isi', type: 'richtext' }, buttons, image(), imagePosition('left'), mobileImage('before'), ratio('landscape')],
  },
  {
    type: 'quoteSection',
    label: 'Kutipan / testimoni tunggal',
    description: 'Kutipan besar di tengah, atau dengan foto di samping.',
    icon: 'Quote',
    styled: true,
    titleField: 'quote',
    fields: [
      { name: 'quote', label: 'Kutipan', type: 'textarea', max: 1000, required: true },
      { name: 'attribution', label: 'Nama / sumber', type: 'text', max: 160 },
      buttons,
      image('Foto (opsional)'),
      {
        name: 'layout',
        label: 'Tata letak',
        type: 'select',
        group: 'tampilan',
        options: [
          { value: 'centered', label: 'Di tengah (tanpa foto)' },
          { value: 'withImage', label: 'Dengan foto di samping' },
        ],
        default: 'centered',
      },
      imagePosition('left'),
    ],
  },
  {
    type: 'cardsSection',
    label: 'Kartu (editorial / sub-brand / dll.)',
    description: '1–4 kolom kartu dengan foto, polos, atau bernomor.',
    icon: 'LayoutGrid',
    styled: true,
    fields: [
      eyebrow,
      heading,
      intro,
      {
        name: 'cards',
        label: 'Kartu',
        type: 'list',
        max: 24,
        itemLabel: 'Kartu',
        fields: [
          { name: 'image', label: 'Foto', type: 'image' },
          { name: 'title', label: 'Judul', type: 'text', max: 160 },
          { name: 'text', label: 'Teks', type: 'textarea', max: 1000 },
          { name: 'linkLabel', label: 'Tulisan tautan', type: 'text', max: 80 },
          { name: 'link', label: 'Tautan', type: 'link' },
        ],
      },
      columns(3),
      {
        name: 'cardStyle',
        label: 'Gaya kartu',
        type: 'select',
        group: 'tampilan',
        options: [
          { value: 'image', label: 'Dengan foto' },
          { value: 'plain', label: 'Polos' },
          { value: 'numbered', label: 'Bernomor (1, 2, 3…)' },
        ],
        default: 'image',
      },
    ],
  },
  {
    type: 'featuresSection',
    label: 'Daftar poin (dengan ikon)',
    description: 'Poin-poin dengan ikon pilihan.',
    icon: 'ListChecks',
    styled: true,
    fields: [
      eyebrow,
      heading,
      intro,
      {
        name: 'items',
        label: 'Poin',
        type: 'list',
        max: 24,
        itemLabel: 'Poin',
        fields: [
          { name: 'icon', label: 'Ikon', type: 'select', options: ICON_OPTIONS, default: 'none' },
          { name: 'title', label: 'Judul', type: 'text', max: 160 },
          { name: 'text', label: 'Teks', type: 'textarea', max: 1000 },
          { name: 'linkLabel', label: 'Tulisan tautan', type: 'text', max: 80 },
          { name: 'link', label: 'Tautan', type: 'link' },
        ],
      },
      columns(3),
    ],
  },
  {
    type: 'ctaSection',
    label: 'Ajakan (panel CTA)',
    description: '1–3 panel berwarna dengan tombol.',
    icon: 'MousePointerClick',
    styled: true,
    titleField: 'panels',
    fields: [
      {
        name: 'panels',
        label: 'Panel',
        type: 'list',
        max: 3,
        itemLabel: 'Panel',
        fields: [
          { name: 'heading', label: 'Judul', type: 'text', max: 160, required: true },
          { name: 'text', label: 'Teks', type: 'textarea', max: 600 },
          { name: 'buttonLabel', label: 'Tulisan tombol', type: 'text', max: 80 },
          { name: 'link', label: 'Tautan', type: 'link' },
          {
            name: 'tone',
            label: 'Warna panel',
            type: 'select',
            options: [
              { value: 'primary', label: 'Warna utama (gelap)' },
              { value: 'accent', label: 'Warna kedua (terakota)' },
              { value: 'soft', label: 'Lembut (blush)' },
              { value: 'paper', label: 'Krem terang' },
            ],
            default: 'primary',
          },
        ],
      },
    ],
  },
  {
    type: 'faqSection',
    label: 'Tanya jawab (FAQ)',
    description: 'Pertanyaan & jawaban; otomatis dibaca Google sebagai FAQ.',
    icon: 'CircleHelp',
    styled: true,
    fields: [
      eyebrow,
      heading,
      intro,
      {
        name: 'items',
        label: 'Pertanyaan',
        type: 'list',
        max: 40,
        itemLabel: 'Pertanyaan',
        fields: [
          { name: 'q', label: 'Pertanyaan', type: 'text', max: 300, required: true },
          { name: 'a', label: 'Jawaban', type: 'textarea', max: 2000, required: true },
        ],
      },
    ],
  },
  {
    type: 'gallerySection',
    label: 'Galeri foto',
    description: 'Kumpulan foto 1–4 kolom dengan keterangan.',
    icon: 'Images',
    styled: true,
    fields: [eyebrow, heading, intro, { name: 'images', label: 'Foto', type: 'images', max: 40 }, columns(3), ratio('square')],
  },
  {
    type: 'dataSection',
    label: 'Blok data otomatis',
    description: 'Produk, sub-brand, testimoni, artikel, kontak — isinya diambil otomatis dari menu lain.',
    icon: 'Database',
    styled: true,
    titleField: 'source',
    fields: [
      { name: 'source', label: 'Tampilkan', type: 'select', options: DATA_SOURCES, required: true, default: 'subBrands' },
      { name: 'subBrand', label: 'Lini', type: 'select', optionsFrom: 'subBrands', showIf: { field: 'source', equals: ['products'] } },
      { name: 'category', label: 'Kategori produk (kosong = semua)', type: 'text', max: 80, showIf: { field: 'source', equals: ['productGrid'] }, help: 'Tulis slug kategori, mis. "frozen".' },
      { name: 'limit', label: 'Jumlah maksimum', type: 'number', min: 1, max: 24, default: 6, showIf: { field: 'source', equals: ['productGrid', 'journal'] } },
      eyebrow,
      heading,
      intro,
    ],
  },
  {
    type: 'formSection',
    label: 'Formulir permintaan (katering / hadiah)',
    description: 'Form penawaran yang dikirim lewat WhatsApp.',
    icon: 'Mail',
    styled: true,
    fields: [
      {
        name: 'variant',
        label: 'Jenis formulir',
        type: 'select',
        options: [
          { value: 'catering', label: 'Penawaran katering / acara' },
          { value: 'gifting', label: 'Hadiah / hampers' },
          { value: 'corporate', label: 'Corporate (perusahaan)' },
        ],
        default: 'catering',
        required: true,
      },
      eyebrow,
      heading,
      intro,
      { name: 'asideHeading', label: 'Judul kotak samping (opsional)', type: 'text', max: 160 },
      { name: 'asideText', label: 'Teks kotak samping', type: 'textarea', max: 600 },
      { name: 'asideChannels', label: 'Tombol kanal di kotak samping', type: 'channels' },
    ],
  },
  {
    type: 'contactSection',
    label: 'Kontak',
    description: 'Info kontak, WhatsApp, email dan area layanan.',
    icon: 'Phone',
    styled: true,
    fields: [eyebrow, heading, intro, { name: 'showChannels', label: 'Tampilkan tombol kanal pemesanan', type: 'boolean', default: true }],
  },
  {
    type: 'customBlock',
    label: 'Blok kustom (teks + foto bebas)',
    description: 'Kotak konten bebas: judul, isi teks kaya, foto opsional, tombol — dengan lebar pilihan.',
    icon: 'Square',
    styled: true,
    fields: [
      eyebrow,
      heading,
      { name: 'body', label: 'Isi', type: 'richtext' },
      image('Foto (opsional)'),
      buttons,
      {
        name: 'width',
        label: 'Lebar kotak',
        type: 'select',
        group: 'tampilan',
        options: [
          { value: 'narrow', label: 'Sempit' },
          { value: 'normal', label: 'Normal' },
          { value: 'full', label: 'Penuh' },
        ],
        default: 'normal',
      },
      align,
      {
        name: 'boxed',
        label: 'Tampilkan sebagai kotak (kartu)',
        type: 'boolean',
        group: 'tampilan',
        default: true,
      },
    ],
  },
  {
    type: 'dividerSection',
    label: 'Pemisah / jarak',
    description: 'Garis berlian ◇ atau ruang kosong.',
    icon: 'Minus',
    styled: false,
    titleField: 'style',
    fields: [
      {
        name: 'style',
        label: 'Gaya',
        type: 'select',
        options: [
          { value: 'diamond', label: 'Garis dengan berlian (◇)' },
          { value: 'space', label: 'Jarak kosong' },
        ],
        default: 'diamond',
      },
    ],
  },
];

export const SECTION_BY_TYPE: Record<string, SectionDef> = Object.fromEntries(SECTION_DEFS.map((d) => [d.type, d]));

/** All fields of a section type including the shared style fields. */
export function fieldsOf(def: SectionDef): FieldDef[] {
  return def.styled ? [...def.fields, ...STYLE_FIELDS] : def.fields;
}

/** A new section of `type`, prefilled with defaults. */
export function newSection(type: string, key: string): Record<string, unknown> {
  const def = SECTION_BY_TYPE[type];
  const s: Record<string, unknown> = { _type: type, _key: key };
  if (!def) return s;
  for (const f of fieldsOf(def)) {
    if (f.default !== undefined) s[f.name] = f.default;
  }
  if (type === 'heroSection') s.heading = 'Judul baru';
  if (type === 'ctaSection') s.panels = [{ _key: `${key}-p1`, heading: 'Judul panel', tone: 'primary' }];
  if (type === 'quoteSection') s.quote = 'Tulis kutipan di sini.';
  return s;
}

/** Human title of a section for the outline list. */
export function sectionTitle(s: Record<string, unknown>): string {
  const def = SECTION_BY_TYPE[s._type as string];
  if (s._type === 'ctaSection') {
    const p = (s.panels as { heading?: string }[] | undefined)?.[0];
    return p?.heading || def?.label || 'Panel';
  }
  if (s._type === 'dataSection') {
    const src = DATA_SOURCES.find((o) => o.value === s.source)?.label;
    return (s.heading as string) || src || 'Blok data';
  }
  if (s._type === 'dividerSection') return s.style === 'space' ? 'Jarak kosong' : 'Garis pemisah ◇';
  const t = (s[def?.titleField ?? 'heading'] as string) || (s.eyebrow as string) || (s.heading as string);
  return t || '(tanpa judul)';
}
