import { defineType, defineField, defineArrayMember, type SchemaTypeDefinition } from 'sanity';
import {
  CogIcon,
  TagIcon,
  PackageIcon,
  DocumentTextIcon,
  DocumentsIcon,
  StarIcon,
  HeartIcon,
  CommentIcon,
} from '@sanity/icons';

/**
 * DAMA KITCHEN content model.
 *
 * Design tokens (sub-brand marker colors, icon keys, slugs) stay in code —
 * the CMS holds editable copy, photos, prices, journal posts and free pages.
 */

// Rich text used by journal posts and free pages.
const blockContent = defineType({
  name: 'blockContent',
  title: 'Konten',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraf', value: 'normal' },
        { title: 'Judul', value: 'h2' },
        { title: 'Sub-judul', value: 'h3' },
        { title: 'Kutipan', value: 'blockquote' },
      ],
      lists: [{ title: 'Poin', value: 'bullet' }],
      marks: {
        decorators: [
          { title: 'Tebal', value: 'strong' },
          { title: 'Miring', value: 'em' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            type: 'object',
            title: 'Tautan',
            fields: [{ name: 'href', type: 'url', title: 'URL' }],
          }),
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Teks alternatif (alt)' }],
    }),
  ],
});

const faqField = defineArrayMember({
  type: 'object',
  name: 'faq',
  fields: [
    defineField({ name: 'q', type: 'string', title: 'Pertanyaan' }),
    defineField({ name: 'a', type: 'text', rows: 3, title: 'Jawaban' }),
  ],
  preview: { select: { title: 'q' } },
});

const channelOptions = {
  list: [
    { title: 'Shopee', value: 'shopee' },
    { title: 'TikTok Shop', value: 'tiktok' },
    { title: 'WhatsApp', value: 'whatsapp' },
    { title: 'GoFood', value: 'gofood' },
    { title: 'GrabFood', value: 'grab' },
  ],
};

// ── Singleton: site settings + contact + channels ──────────────
const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Pengaturan Situs',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'brand', title: 'Brand' },
    { name: 'beranda', title: 'Beranda' },
    { name: 'tampilan', title: 'Tampilan' },
    { name: 'contact', title: 'Kontak & Sosial' },
    { name: 'channels', title: 'Kanal Jualan' },
    { name: 'seasonal', title: 'Perayaan' },
  ],
  fields: [
    defineField({ name: 'tagline', type: 'string', title: 'Tagline', group: 'brand' }),
    defineField({ name: 'hashtag', type: 'string', title: 'Hashtag', group: 'brand' }),
    defineField({ name: 'brandLineEn', type: 'string', title: 'Brand line (EN)', group: 'brand' }),
    defineField({ name: 'umbrellaPromise', type: 'text', rows: 2, title: 'Janji utama', group: 'brand' }),
    defineField({ name: 'rootProverb', type: 'string', title: 'Peribahasa akar', group: 'brand' }),

    // ── Beranda ──
    defineField({
      name: 'heroHeadline',
      type: 'string',
      title: 'Judul besar hero',
      description: 'Tulisan paling besar di Beranda. Contoh: "Taraso Disayang."',
      group: 'beranda',
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      title: 'Foto hero Beranda',
      options: { hotspot: true },
      group: 'beranda',
    }),
    defineField({
      name: 'essence',
      type: 'text',
      rows: 2,
      title: 'Kalimat inti (di bawah hero)',
      group: 'beranda',
    }),
    defineField({ name: 'founderQuote', type: 'text', rows: 3, title: 'Kutipan pendiri', group: 'beranda' }),
    defineField({ name: 'founderName', type: 'string', title: 'Nama pendiri', group: 'beranda' }),
    defineField({ name: 'founderRole', type: 'string', title: 'Jabatan pendiri', group: 'beranda' }),
    defineField({
      name: 'founderImage',
      type: 'image',
      title: 'Foto pendiri / proses',
      options: { hotspot: true },
      group: 'beranda',
    }),

    // ── Tampilan (preset aman) ──
    defineField({
      name: 'logo',
      type: 'image',
      title: 'Logo (header)',
      description: 'Logo untuk header (latar krem). Kosongkan untuk memakai logo teks bawaan. PNG transparan disarankan.',
      group: 'tampilan',
    }),
    defineField({
      name: 'logoLight',
      type: 'image',
      title: 'Logo versi terang (footer)',
      description: 'Logo untuk footer berlatar gelap (teal). Sebaiknya berwarna krem/putih.',
      group: 'tampilan',
    }),
    defineField({
      name: 'monogram',
      type: 'image',
      title: 'Monogram (header saat di-scroll)',
      description: 'Ikon kecil "D" yang muncul saat halaman digulir. Kosongkan untuk memakai bawaan.',
      group: 'tampilan',
    }),
    defineField({
      name: 'heroStyle',
      type: 'string',
      title: 'Latar hero Beranda',
      description: 'Pilihan aman yang tetap sesuai brand & terbaca.',
      options: {
        list: [
          { title: 'Krem (default)', value: 'cream' },
          { title: 'Teal (gelap)', value: 'teal' },
          { title: 'Blush (lembut)', value: 'blush' },
        ],
        layout: 'radio',
      },
      initialValue: 'cream',
      group: 'tampilan',
    }),
    defineField({
      name: 'backgroundMotif',
      type: 'string',
      title: 'Motif latar (di belakang hero)',
      options: {
        list: [
          { title: 'Songket Geometris', value: 'songket-geometric' },
          { title: 'Bunga', value: 'bunga-floral' },
          { title: 'Daun', value: 'daun-leaf' },
          { title: 'Geometris Emas', value: 'geometric-gold' },
          { title: 'Tanpa motif', value: 'none' },
        ],
      },
      initialValue: 'songket-geometric',
      group: 'tampilan',
    }),
    defineField({
      name: 'motifImage',
      type: 'image',
      title: 'Motif kustom (opsional)',
      description: 'Unggah motif sendiri untuk menggantikan pilihan di atas. Gunakan pola yang bisa diulang.',
      group: 'tampilan',
    }),
    defineField({
      name: 'motifOpacity',
      type: 'number',
      title: 'Kepekatan motif (%)',
      description: 'Antara 0 dan 12 agar tetap halus dan tidak mengganggu teks.',
      initialValue: 5,
      validation: (r) => r.min(0).max(12),
      group: 'tampilan',
    }),
    defineField({ name: 'whatsappNumber', type: 'string', title: 'Nomor WhatsApp (E.164 tanpa +)', group: 'contact' }),
    defineField({ name: 'email', type: 'string', title: 'Email', group: 'contact' }),
    defineField({ name: 'instagram', type: 'url', title: 'Instagram URL', group: 'contact' }),
    defineField({ name: 'tiktok', type: 'url', title: 'TikTok URL', group: 'contact' }),
    defineField({ name: 'threads', type: 'url', title: 'Threads URL', group: 'contact' }),
    defineField({ name: 'coverage', type: 'text', rows: 2, title: 'Area layanan', group: 'contact' }),
    defineField({ name: 'shopeeUrl', type: 'url', title: 'Shopee URL', group: 'channels' }),
    defineField({ name: 'tiktokShopUrl', type: 'url', title: 'TikTok Shop URL', group: 'channels' }),
    defineField({ name: 'gofoodUrl', type: 'url', title: 'GoFood URL', group: 'channels' }),
    defineField({ name: 'grabUrl', type: 'url', title: 'GrabFood URL', group: 'channels' }),
    defineField({ name: 'seasonalActive', type: 'boolean', title: 'Aktifkan banner perayaan', group: 'seasonal' }),
    defineField({ name: 'seasonalLabel', type: 'string', title: 'Label perayaan', group: 'seasonal' }),
    defineField({ name: 'seasonalMessage', type: 'text', rows: 2, title: 'Pesan perayaan', group: 'seasonal' }),
  ],
  preview: { prepare: () => ({ title: 'Pengaturan Situs' }) },
});

// ── Sub-brand (copy only; markers/slug are code tokens) ────────
const subBrandSlugs = {
  list: [
    { title: 'LAMAK DAMA', value: 'lamak-dama' },
    { title: 'WARISAN DAMA', value: 'warisan-dama' },
    { title: 'HIDANG BASAMO', value: 'hidang-basamo' },
    { title: 'DAMA KAPAU', value: 'dama-kapau' },
    { title: 'TANDO MATO', value: 'tando-mato' },
  ],
};

const subBrand = defineType({
  name: 'subBrand',
  title: 'Sub-brand',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Nama' }),
    defineField({
      name: 'slug',
      type: 'string',
      title: 'Pengenal lini',
      description: 'Jangan diubah — menentukan alamat halaman & warna penanda lini.',
      options: subBrandSlugs,
      validation: (r) => r.required(),
    }),
    defineField({ name: 'shortName', type: 'string', title: 'Nama singkat (tag)' }),
    defineField({
      name: 'emotion',
      type: 'string',
      title: 'Emosi',
      description: 'Emosi tetap tiap lini — jangan ditukar (Tenang/Bangga/Hangat/Lega/Berkesan).',
    }),
    defineField({
      name: 'lead',
      type: 'text',
      rows: 2,
      title: 'Pesan utama',
      description: 'Kalimat hangat & jujur. Hindari huruf kapital berlebih, tanda seru beruntun, atau klaim "ternikmat/nomor satu".',
    }),
    defineField({ name: 'about', type: 'text', rows: 4, title: 'Tentang lini ini' }),
    defineField({ name: 'howToOrder', type: 'text', rows: 3, title: 'Cara memesan' }),
    defineField({
      name: 'channels',
      type: 'array',
      title: 'Kanal (urut; pertama = utama)',
      of: [{ type: 'string', options: channelOptions }],
    }),
    defineField({ name: 'faqs', type: 'array', title: 'FAQ', of: [faqField] }),
    defineField({
      name: 'crossSell',
      type: 'array',
      title: 'Mungkin juga cocok (lini lain)',
      of: [{ type: 'string', options: subBrandSlugs }],
    }),
    defineField({ name: 'heroImage', type: 'image', title: 'Foto hero', options: { hotspot: true } }),
    defineField({ name: 'order', type: 'number', title: 'Urutan tampil' }),
  ],
  orderings: [{ title: 'Urutan', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'emotion' } },
});

// ── Product ────────────────────────────────────────────────────
const product = defineType({
  name: 'product',
  title: 'Produk / Menu',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Nama' }),
    defineField({ name: 'slug', type: 'slug', title: 'Slug', options: { source: 'name' } }),
    defineField({ name: 'blurb', type: 'text', rows: 2, title: 'Deskripsi singkat (jujur, tanpa berlebihan)' }),
    defineField({
      name: 'subBrand',
      type: 'reference',
      title: 'Lini',
      to: [{ type: 'subBrand' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'info',
      type: 'array',
      title: 'Info',
      of: [
        {
          type: 'string',
          options: {
            list: [
              { title: 'Halal', value: 'halal' },
              { title: 'Pedas', value: 'pedas' },
              { title: 'Sambal terpisah', value: 'sambal-terpisah' },
              { title: 'Porsi individu', value: 'porsi' },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'price',
      type: 'number',
      title: 'Harga (Rp, opsional)',
      description: 'Kosongkan bila belum ingin menampilkan harga.',
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Foto',
      description: 'Klik gambar lalu "Edit hotspot" untuk mengatur titik fokus/crop.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'imageCategory',
      type: 'string',
      title: 'Kategori foto (placeholder)',
      options: {
        list: ['food', 'product', 'ingredients', 'process', 'lifestyle'],
      },
      initialValue: 'food',
    }),
    defineField({ name: 'order', type: 'number', title: 'Urutan' }),
  ],
  orderings: [{ title: 'Urutan', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'blurb', media: 'image' } },
});

// ── Small reference docs ───────────────────────────────────────
const pillar = defineType({
  name: 'pillar',
  title: 'Pilar Brand',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({ name: 'title', type: 'string', title: 'Judul' }),
    defineField({ name: 'desc', type: 'text', rows: 2, title: 'Deskripsi' }),
    defineField({
      name: 'icon',
      type: 'string',
      title: 'Ikon',
      options: { list: ['recipe', 'care', 'ingredients', 'love'] },
    }),
    defineField({ name: 'order', type: 'number', title: 'Urutan' }),
  ],
  orderings: [{ title: 'Urutan', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
});

const brandValue = defineType({
  name: 'brandValue',
  title: 'Nilai Brand',
  type: 'document',
  icon: HeartIcon,
  fields: [
    defineField({ name: 'title', type: 'string', title: 'Judul' }),
    defineField({ name: 'desc', type: 'text', rows: 2, title: 'Deskripsi' }),
    defineField({ name: 'order', type: 'number', title: 'Urutan' }),
  ],
  orderings: [{ title: 'Urutan', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
});

const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimoni',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Nama' }),
    defineField({ name: 'context', type: 'string', title: 'Konteks' }),
    defineField({ name: 'quote', type: 'text', rows: 3, title: 'Kutipan' }),
    defineField({ name: 'order', type: 'number', title: 'Urutan' }),
  ],
  orderings: [{ title: 'Urutan', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'context' } },
});

// ── Journal (Catatan Dapur) ────────────────────────────────────
const journalPost = defineType({
  name: 'journalPost',
  title: 'Catatan Dapur (Artikel)',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: 'title', type: 'string', title: 'Judul', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'excerpt', type: 'text', rows: 2, title: 'Ringkasan' }),
    defineField({ name: 'coverImage', type: 'image', title: 'Gambar sampul', options: { hotspot: true } }),
    defineField({ name: 'publishedAt', type: 'datetime', title: 'Tanggal terbit' }),
    defineField({ name: 'body', type: 'blockContent', title: 'Isi artikel' }),
  ],
  orderings: [
    { title: 'Terbaru', name: 'pub', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
  preview: { select: { title: 'title', subtitle: 'excerpt', media: 'coverImage' } },
});

// ── Free pages (buat halaman baru sendiri) ─────────────────────
const page = defineType({
  name: 'page',
  title: 'Halaman',
  type: 'document',
  icon: DocumentsIcon,
  fields: [
    defineField({ name: 'title', type: 'string', title: 'Judul', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug (alamat halaman)',
      description: 'Klik "Generate". Halaman akan hidup di /<slug>. Hindari kata yang sama dengan halaman bawaan (menu, cerita, pesan, dll).',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'eyebrow', type: 'string', title: 'Label kecil (eyebrow)' }),
    defineField({ name: 'intro', type: 'text', rows: 3, title: 'Pengantar' }),
    defineField({ name: 'heroImage', type: 'image', title: 'Foto hero', options: { hotspot: true } }),
    defineField({ name: 'body', type: 'blockContent', title: 'Isi halaman' }),
    defineField({ name: 'seoDescription', type: 'text', rows: 2, title: 'Deskripsi SEO' }),
  ],
  preview: { select: { title: 'title', subtitle: 'slug.current' } },
});

export const schemaTypes: SchemaTypeDefinition[] = [
  blockContent,
  siteSettings,
  subBrand,
  product,
  pillar,
  brandValue,
  testimonial,
  journalPost,
  page,
];
