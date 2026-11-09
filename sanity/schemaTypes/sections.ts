import type { ComponentType } from 'react';
import { defineArrayMember, defineField, defineType, type SchemaTypeDefinition } from 'sanity';
import {
  BlockElementIcon,
  BlockquoteIcon,
  BulbOutlineIcon,
  DatabaseIcon,
  EnvelopeIcon,
  HelpCircleIcon,
  ImagesIcon,
  LaunchIcon,
  RemoveIcon,
  SplitHorizontalIcon,
  TextIcon,
  ThLargeIcon,
} from '@sanity/icons';

/**
 * Page-builder section library. Every page (built-in or custom) is a list of
 * these sections; editors add, reorder, hide and restyle them in Studio.
 *
 * Styling is deliberately palette-based (background = a theme color, not an
 * arbitrary hex) so pages stay readable and on-brand whatever colors are set
 * in Pengaturan Situs → Warna.
 */

// ── Shared field helpers ──────────────────────────────────────

const groups = [
  { name: 'konten', title: 'Konten', default: true },
  { name: 'tampilan', title: 'Tampilan' },
];

const LINK_HELP = 'Contoh: /pesan, /menu, https://…, atau ketik "whatsapp" untuk chat WhatsApp.';

const linkField = (name = 'link', title = 'Tautan') =>
  defineField({
    name,
    title,
    type: 'string',
    description: LINK_HELP,
    validation: (r) =>
      r.custom((v?: string) =>
        !v || v === 'whatsapp' || /^(\/|#|https?:\/\/|mailto:|tel:)/.test(v)
          ? true
          : 'Gunakan alamat yang diawali "/", "https://", "#", "mailto:", "tel:" atau tulis "whatsapp".',
      ),
  });

const buttonsField = defineField({
  name: 'buttons',
  title: 'Tombol',
  type: 'array',
  group: 'konten',
  of: [
    defineArrayMember({
      type: 'object',
      name: 'button',
      title: 'Tombol',
      fields: [
        defineField({ name: 'label', title: 'Tulisan tombol', type: 'string', validation: (r) => r.required() }),
        linkField(),
        defineField({
          name: 'style',
          title: 'Gaya',
          type: 'string',
          options: {
            list: [
              { title: 'Utama (berwarna)', value: 'primary' },
              { title: 'Garis (outline)', value: 'secondary' },
            ],
            layout: 'radio',
          },
          initialValue: 'primary',
        }),
      ],
      preview: { select: { title: 'label', subtitle: 'link' } },
    }),
  ],
  validation: (r) => r.max(3),
});

const imageField = (name = 'image', title = 'Foto') =>
  defineField({
    name,
    title,
    type: 'image',
    group: 'konten',
    options: { hotspot: true },
    description: 'Klik foto lalu "Edit hotspot" untuk mengatur titik fokus.',
    fields: [defineField({ name: 'alt', title: 'Deskripsi foto (alt)', type: 'string' })],
  });

const eyebrowField = defineField({ name: 'eyebrow', title: 'Label kecil di atas judul', type: 'string', group: 'konten' });
const headingField = defineField({ name: 'heading', title: 'Judul', type: 'string', group: 'konten' });
const introField = defineField({ name: 'intro', title: 'Pengantar', type: 'text', rows: 3, group: 'konten' });

const columnsField = (initial: number) =>
  defineField({
    name: 'columns',
    title: 'Jumlah kolom (desktop)',
    type: 'number',
    group: 'tampilan',
    options: { list: [1, 2, 3, 4], layout: 'radio', direction: 'horizontal' },
    initialValue: initial,
  });

const imagePositionField = (initial: 'left' | 'right' = 'right') =>
  defineField({
    name: 'imagePosition',
    title: 'Posisi foto',
    type: 'string',
    group: 'tampilan',
    options: {
      list: [
        { title: 'Kanan', value: 'right' },
        { title: 'Kiri', value: 'left' },
      ],
      layout: 'radio',
      direction: 'horizontal',
    },
    initialValue: initial,
  });

const ratioField = (initial = 'landscape') =>
  defineField({
    name: 'imageRatio',
    title: 'Bentuk foto',
    type: 'string',
    group: 'tampilan',
    options: {
      list: [
        { title: 'Melebar (4:3)', value: 'landscape' },
        { title: 'Persegi', value: 'square' },
        { title: 'Tegak (3:4)', value: 'portrait' },
        { title: 'Lebar (16:9)', value: 'wide' },
      ],
    },
    initialValue: initial,
  });

/** Style options shared by every section. */
export const BACKGROUND_OPTIONS = [
  { title: 'Krem (latar utama)', value: 'cream' },
  { title: 'Krem terang', value: 'paper' },
  { title: 'Krem gelap', value: 'deep' },
  { title: 'Lembut (blush)', value: 'soft' },
  { title: 'Emas muda', value: 'highlight' },
  { title: 'Warna utama (gelap)', value: 'primary' },
  { title: 'Warna aksen', value: 'accent' },
];

const styleFields = [
  defineField({
    name: 'background',
    title: 'Warna latar bagian',
    type: 'string',
    group: 'tampilan',
    description: 'Mengikuti warna tema di Pengaturan Situs → Warna. Warna teks menyesuaikan otomatis.',
    options: { list: BACKGROUND_OPTIONS },
    initialValue: 'cream',
  }),
  defineField({
    name: 'spacing',
    title: 'Jarak atas-bawah',
    type: 'string',
    group: 'tampilan',
    options: {
      list: [
        { title: 'Rapat', value: 'compact' },
        { title: 'Normal', value: 'normal' },
        { title: 'Lega', value: 'spacious' },
      ],
      layout: 'radio',
      direction: 'horizontal',
    },
    initialValue: 'normal',
  }),
  defineField({
    name: 'motif',
    title: 'Motif latar',
    type: 'string',
    group: 'tampilan',
    options: {
      list: [
        { title: 'Tanpa motif', value: 'none' },
        { title: 'Songket Geometris', value: 'songket-geometric' },
        { title: 'Bunga', value: 'bunga-floral' },
        { title: 'Daun', value: 'daun-leaf' },
        { title: 'Geometris Emas', value: 'geometric-gold' },
      ],
    },
    initialValue: 'none',
  }),
  defineField({
    name: 'motifImage',
    title: 'Motif kustom (opsional)',
    type: 'image',
    group: 'tampilan',
    description: 'Menggantikan pilihan motif di atas. Gunakan pola yang bisa diulang.',
  }),
  defineField({
    name: 'motifOpacity',
    title: 'Kepekatan motif (%)',
    type: 'number',
    group: 'tampilan',
    description: '0–12 agar tetap halus.',
    initialValue: 5,
    validation: (r) => r.min(0).max(12),
  }),
  defineField({
    name: 'dividerAbove',
    title: 'Tampilkan garis pemisah (◇) di atas bagian ini',
    type: 'boolean',
    group: 'tampilan',
    initialValue: false,
  }),
  defineField({
    name: 'anchor',
    title: 'ID tautan (opsional)',
    type: 'string',
    group: 'tampilan',
    description: 'Misal "paket" → bisa ditautkan dengan /hadiah#paket.',
    validation: (r) =>
      r.custom((v?: string) => !v || /^[a-z0-9-]+$/.test(v) || 'Gunakan huruf kecil, angka, dan tanda "-".'),
  }),
  defineField({
    name: 'hidden',
    title: 'Sembunyikan sementara',
    type: 'boolean',
    group: 'tampilan',
    description: 'Bagian tetap tersimpan tetapi tidak tampil di website.',
    initialValue: false,
  }),
];

/** Defines a section object type with the shared groups + style fields. */
function section(def: {
  name: string;
  title: string;
  icon: ComponentType;
  fields: ReturnType<typeof defineField>[];
  previewTitle?: string;
}) {
  return defineType({
    name: def.name,
    title: def.title,
    type: 'object',
    icon: def.icon,
    groups,
    fields: [...def.fields, ...styleFields],
    preview: {
      select: { heading: def.previewTitle ?? 'heading', eyebrow: 'eyebrow', hidden: 'hidden' },
      prepare: ({ heading, eyebrow, hidden }: { heading?: string; eyebrow?: string; hidden?: boolean }) => ({
        title: `${hidden ? '🙈 ' : ''}${heading || eyebrow || '(tanpa judul)'}`,
        subtitle: def.title,
        media: def.icon,
      }),
    },
  });
}

// ── Section types ─────────────────────────────────────────────

const heroSection = section({
  name: 'heroSection',
  title: 'Hero (pembuka halaman)',
  icon: BlockElementIcon,
  fields: [
    eyebrowField,
    defineField({ ...headingField, validation: (r) => r.required() }),
    defineField({
      name: 'text',
      title: 'Teks',
      type: 'text',
      rows: 4,
      group: 'konten',
      description: 'Pisahkan paragraf dengan baris kosong.',
    }),
    buttonsField,
    imageField(),
    defineField({
      name: 'imagePosition',
      title: 'Posisi foto',
      type: 'string',
      group: 'tampilan',
      options: {
        list: [
          { title: 'Kanan', value: 'right' },
          { title: 'Kiri', value: 'left' },
          { title: 'Tanpa foto', value: 'none' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'right',
    }),
    ratioField('landscape'),
    defineField({
      name: 'headingSize',
      title: 'Ukuran judul',
      type: 'string',
      group: 'tampilan',
      options: {
        list: [
          { title: 'Besar', value: 'large' },
          { title: 'Sangat besar', value: 'xlarge' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'large',
    }),
  ],
});

const textSection = section({
  name: 'textSection',
  title: 'Teks',
  icon: TextIcon,
  fields: [
    eyebrowField,
    headingField,
    defineField({ name: 'body', title: 'Isi', type: 'blockContent', group: 'konten' }),
    buttonsField,
    defineField({
      name: 'align',
      title: 'Perataan',
      type: 'string',
      group: 'tampilan',
      options: {
        list: [
          { title: 'Kiri', value: 'left' },
          { title: 'Tengah', value: 'center' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'left',
    }),
  ],
});

const splitSection = section({
  name: 'splitSection',
  title: 'Foto + Teks',
  icon: SplitHorizontalIcon,
  fields: [
    eyebrowField,
    headingField,
    defineField({ name: 'body', title: 'Isi', type: 'blockContent', group: 'konten' }),
    buttonsField,
    imageField(),
    imagePositionField('left'),
    ratioField('landscape'),
  ],
});

const quoteSection = section({
  name: 'quoteSection',
  title: 'Kutipan',
  icon: BlockquoteIcon,
  previewTitle: 'quote',
  fields: [
    defineField({ name: 'quote', title: 'Kutipan', type: 'text', rows: 3, group: 'konten', validation: (r) => r.required() }),
    defineField({ name: 'attribution', title: 'Nama / sumber', type: 'string', group: 'konten' }),
    buttonsField,
    imageField('image', 'Foto (opsional)'),
    defineField({
      name: 'layout',
      title: 'Tata letak',
      type: 'string',
      group: 'tampilan',
      options: {
        list: [
          { title: 'Di tengah (tanpa foto)', value: 'centered' },
          { title: 'Dengan foto di samping', value: 'withImage' },
        ],
        layout: 'radio',
      },
      initialValue: 'centered',
    }),
    imagePositionField('left'),
  ],
});

const cardsSection = section({
  name: 'cardsSection',
  title: 'Kartu',
  icon: ThLargeIcon,
  fields: [
    eyebrowField,
    headingField,
    introField,
    defineField({
      name: 'cards',
      title: 'Kartu',
      type: 'array',
      group: 'konten',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'card',
          title: 'Kartu',
          fields: [
            imageField(),
            defineField({ name: 'title', title: 'Judul', type: 'string' }),
            defineField({ name: 'text', title: 'Teks', type: 'text', rows: 3 }),
            defineField({ name: 'linkLabel', title: 'Tulisan tautan', type: 'string' }),
            linkField(),
          ],
          preview: { select: { title: 'title', subtitle: 'text', media: 'image' } },
        }),
      ],
    }),
    columnsField(3),
    defineField({
      name: 'cardStyle',
      title: 'Gaya kartu',
      type: 'string',
      group: 'tampilan',
      options: {
        list: [
          { title: 'Dengan foto', value: 'image' },
          { title: 'Polos', value: 'plain' },
          { title: 'Bernomor (1, 2, 3…)', value: 'numbered' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
    }),
  ],
});

const ICON_OPTIONS = [
  { title: 'Tanpa ikon', value: 'none' },
  { title: 'Resep (buku)', value: 'recipe' },
  { title: 'Kepedulian (tangan & hati)', value: 'care' },
  { title: 'Bahan (daun)', value: 'ingredients' },
  { title: 'Kasih (mangkuk & hati)', value: 'love' },
  { title: 'Panaskan', value: 'panaskan' },
  { title: 'Porsi', value: 'porsi' },
  { title: 'Masa simpan', value: 'masa-simpan' },
  { title: 'Halal', value: 'halal' },
  { title: 'Pedas', value: 'pedas' },
  { title: 'Sambal terpisah', value: 'sambal-terpisah' },
  { title: 'Kemasan ulang pakai', value: 'reusable' },
  { title: 'Kirim aman', value: 'kirim-aman' },
];

const featuresSection = section({
  name: 'featuresSection',
  title: 'Daftar poin (dengan ikon)',
  icon: BulbOutlineIcon,
  fields: [
    eyebrowField,
    headingField,
    introField,
    defineField({
      name: 'items',
      title: 'Poin',
      type: 'array',
      group: 'konten',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'feature',
          title: 'Poin',
          fields: [
            defineField({ name: 'icon', title: 'Ikon', type: 'string', options: { list: ICON_OPTIONS }, initialValue: 'none' }),
            defineField({ name: 'title', title: 'Judul', type: 'string' }),
            defineField({ name: 'text', title: 'Teks', type: 'text', rows: 3 }),
            defineField({ name: 'linkLabel', title: 'Tulisan tautan', type: 'string' }),
            linkField(),
          ],
          preview: { select: { title: 'title', subtitle: 'text' } },
        }),
      ],
    }),
    columnsField(3),
  ],
});

const ctaSection = section({
  name: 'ctaSection',
  title: 'Ajakan (panel CTA)',
  icon: LaunchIcon,
  previewTitle: 'panels.0.heading',
  fields: [
    defineField({
      name: 'panels',
      title: 'Panel',
      type: 'array',
      group: 'konten',
      validation: (r) => r.min(1).max(3),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'ctaPanel',
          title: 'Panel',
          fields: [
            defineField({ name: 'heading', title: 'Judul', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'text', title: 'Teks', type: 'text', rows: 2 }),
            defineField({ name: 'buttonLabel', title: 'Tulisan tombol', type: 'string' }),
            linkField(),
            defineField({
              name: 'tone',
              title: 'Warna panel',
              type: 'string',
              options: {
                list: [
                  { title: 'Warna utama (gelap)', value: 'primary' },
                  { title: 'Warna aksen', value: 'accent' },
                  { title: 'Lembut (blush)', value: 'soft' },
                  { title: 'Krem terang', value: 'paper' },
                ],
              },
              initialValue: 'primary',
            }),
          ],
          preview: { select: { title: 'heading', subtitle: 'buttonLabel' } },
        }),
      ],
    }),
  ],
});

const faqSection = section({
  name: 'faqSection',
  title: 'Tanya jawab (FAQ)',
  icon: HelpCircleIcon,
  fields: [
    eyebrowField,
    headingField,
    introField,
    defineField({
      name: 'items',
      title: 'Pertanyaan',
      type: 'array',
      group: 'konten',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          title: 'Pertanyaan',
          fields: [
            defineField({ name: 'q', title: 'Pertanyaan', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'a', title: 'Jawaban', type: 'text', rows: 4, validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'q', subtitle: 'a' } },
        }),
      ],
    }),
  ],
});

const gallerySection = section({
  name: 'gallerySection',
  title: 'Galeri foto',
  icon: ImagesIcon,
  fields: [
    eyebrowField,
    headingField,
    introField,
    defineField({
      name: 'images',
      title: 'Foto',
      type: 'array',
      group: 'konten',
      options: { layout: 'grid' },
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Deskripsi foto (alt)', type: 'string' }),
            defineField({ name: 'caption', title: 'Keterangan', type: 'string' }),
          ],
        }),
      ],
    }),
    columnsField(3),
    ratioField('square'),
  ],
});

export const DATA_SOURCES = [
  { title: 'Kartu lini (sub-brand)', value: 'subBrands' },
  { title: 'Pilar brand', value: 'pillars' },
  { title: 'Nilai brand', value: 'values' },
  { title: 'Testimoni', value: 'testimonials' },
  { title: 'Tombol kanal pemesanan', value: 'channels' },
  { title: 'Panduan kanal per lini (halaman Pesan)', value: 'channelMatrix' },
  { title: 'Menu lengkap + filter', value: 'menu' },
  { title: 'Produk dari satu lini', value: 'products' },
  { title: 'Paket hampers (Si Ketek–Si Gadang)', value: 'giftTiers' },
  { title: 'Banner perayaan (bila aktif)', value: 'seasonalBanner' },
  { title: 'Artikel Catatan Dapur terbaru', value: 'journal' },
  { title: 'Info kontak & area layanan', value: 'contact' },
];

const dataSection = section({
  name: 'dataSection',
  title: 'Blok data otomatis',
  icon: DatabaseIcon,
  fields: [
    defineField({
      name: 'source',
      title: 'Tampilkan',
      type: 'string',
      group: 'konten',
      description: 'Isi blok ini diambil otomatis dari menu lain di Studio (mis. Sub-brand, Produk, Testimoni).',
      options: { list: DATA_SOURCES },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'subBrand',
      title: 'Lini',
      type: 'string',
      group: 'konten',
      description: 'Hanya untuk "Produk dari satu lini".',
      options: {
        list: [
          { title: 'LAMAK DAMA', value: 'lamak-dama' },
          { title: 'WARISAN DAMA', value: 'warisan-dama' },
          { title: 'DAMA KAPAU', value: 'dama-kapau' },
          { title: 'TANDO MATO', value: 'tando-mato' },
        ],
      },
      hidden: ({ parent }) => parent?.source !== 'products',
    }),
    eyebrowField,
    headingField,
    introField,
  ],
});

const formSection = section({
  name: 'formSection',
  title: 'Formulir permintaan',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'variant',
      title: 'Jenis formulir',
      type: 'string',
      group: 'konten',
      options: {
        list: [
          { title: 'Penawaran katering / acara', value: 'catering' },
          { title: 'Hadiah / hampers', value: 'gifting' },
        ],
        layout: 'radio',
      },
      initialValue: 'catering',
      validation: (r) => r.required(),
    }),
    eyebrowField,
    headingField,
    introField,
    defineField({ name: 'asideHeading', title: 'Judul kotak samping (opsional)', type: 'string', group: 'konten' }),
    defineField({ name: 'asideText', title: 'Teks kotak samping', type: 'text', rows: 2, group: 'konten' }),
    defineField({
      name: 'asideChannels',
      title: 'Tombol kanal di kotak samping',
      type: 'array',
      group: 'konten',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Shopee', value: 'shopee' },
          { title: 'TikTok Shop', value: 'tiktok' },
          { title: 'WhatsApp', value: 'whatsapp' },
          { title: 'GoFood', value: 'gofood' },
          { title: 'GrabFood', value: 'grab' },
        ],
      },
    }),
  ],
});

const dividerSection = defineType({
  name: 'dividerSection',
  title: 'Pemisah / jarak',
  type: 'object',
  icon: RemoveIcon,
  fields: [
    defineField({
      name: 'style',
      title: 'Gaya',
      type: 'string',
      options: {
        list: [
          { title: 'Garis dengan berlian (◇)', value: 'diamond' },
          { title: 'Jarak kosong', value: 'space' },
        ],
        layout: 'radio',
      },
      initialValue: 'diamond',
    }),
    defineField({ name: 'hidden', title: 'Sembunyikan sementara', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { style: 'style' },
    prepare: ({ style }: { style?: string }) => ({
      title: style === 'space' ? 'Jarak kosong' : 'Garis pemisah ◇',
      subtitle: 'Pemisah',
    }),
  },
});

export const SECTION_TYPES = [
  heroSection,
  textSection,
  splitSection,
  quoteSection,
  cardsSection,
  featuresSection,
  ctaSection,
  faqSection,
  gallerySection,
  dataSection,
  formSection,
  dividerSection,
] satisfies SchemaTypeDefinition[];

/** The "sections" array field used by pages (and sub-brand extras). */
export const sectionsField = (opts: { name?: string; title?: string; description?: string; group?: string } = {}) =>
  defineField({
    name: opts.name ?? 'sections',
    title: opts.title ?? 'Susunan halaman',
    description:
      opts.description ??
      'Tambah, hapus, geser (seret ⋮⋮), dan sembunyikan bagian. Setiap bagian punya tab "Tampilan" untuk warna latar, jarak, dan motif.',
    type: 'array',
    group: opts.group,
    of: SECTION_TYPES.map((t) => defineArrayMember({ type: t.name })),
  });
