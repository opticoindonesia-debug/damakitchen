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
import { THEME_DEFAULTS, contrastRatio } from '@/lib/theme';
import { BUILT_IN_PAGES, RESERVED_SLUGS, isBuiltInPageId } from '@/lib/pages';
import { SECTION_TYPES, sectionsField } from './sections';
import { DEFAULT_FOOTER_TEXT, DEFAULT_NAV_CTA, DEFAULT_SUBBRAND_LABELS } from '@/lib/siteText';

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

// ── Color fields with readability warnings ─────────────────────
type ColorValue = { hex?: string } | undefined;
type ThemeDoc = Record<string, ColorValue>;
const hexOf = (doc: ThemeDoc | undefined, key: string, fallback: string) => doc?.[key]?.hex ?? fallback;

/** Readability rule per role: [field compared against, minimum ratio, message]. */
const readability: Record<string, (doc: ThemeDoc | undefined, hex: string) => string | true> = {
  primary: (doc, hex) => {
    const r = contrastRatio(hex, hexOf(doc, 'colorBackground', THEME_DEFAULTS.background)) ?? 21;
    return r >= 4.5 || `Judul dengan warna ini di atas latar halaman sulit dibaca (rasio ${r.toFixed(1)}:1, disarankan ≥ 4.5:1). Pilih warna yang lebih gelap.`;
  },
  accent: (doc, hex) => {
    const r = contrastRatio(hex, hexOf(doc, 'colorBackground', THEME_DEFAULTS.background)) ?? 21;
    return r >= 3 || `Tulisan tombol pada warna ini kurang kontras (rasio ${r.toFixed(1)}:1, disarankan ≥ 3:1).`;
  },
  background: (doc, hex) => {
    const r = contrastRatio(hex, hexOf(doc, 'colorText', THEME_DEFAULTS.text)) ?? 21;
    return r >= 4.5 || `Teks di atas latar ini sulit dibaca (rasio ${r.toFixed(1)}:1, disarankan ≥ 4.5:1). Pilih latar yang lebih terang.`;
  },
  text: (doc, hex) => {
    const r = contrastRatio(hex, hexOf(doc, 'colorBackground', THEME_DEFAULTS.background)) ?? 21;
    return r >= 4.5 || `Warna teks ini sulit dibaca di atas latar halaman (rasio ${r.toFixed(1)}:1, disarankan ≥ 4.5:1).`;
  },
};

function colorField(name: string, title: string, description: string, role?: keyof typeof readability) {
  return defineField({
    name,
    title,
    type: 'color',
    group: 'warna',
    description: `${description}. Kosongkan untuk kembali ke warna asli.`,
    options: { disableAlpha: true },
    validation: role
      ? (rule) =>
          rule
            .custom((value: ColorValue, ctx) =>
              value?.hex ? readability[role](ctx.document as ThemeDoc | undefined, value.hex) : true,
            )
            .warning()
      : undefined,
  });
}

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
    { name: 'warna', title: 'Warna' },
    { name: 'navigasi', title: 'Navigasi & Footer' },
    { name: 'teks', title: 'Teks halaman lini' },
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

    // ── Navigasi & Footer ──
    defineField({
      name: 'navItems',
      title: 'Menu atas',
      type: 'array',
      group: 'navigasi',
      description: 'Urutan bebas (seret ⋮⋮). Kosongkan untuk memakai menu bawaan: Cerita · Menu · Sub-brand · Katering · Hadiah.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'navLink',
          title: 'Tautan',
          fields: [
            defineField({ name: 'label', title: 'Tulisan', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'link', title: 'Tautan', type: 'string', description: 'Contoh: /cerita atau https://…', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'link' } },
        }),
        defineArrayMember({
          type: 'object',
          name: 'navSubBrands',
          title: 'Daftar lini (menu turun)',
          fields: [defineField({ name: 'label', title: 'Tulisan', type: 'string', initialValue: 'Sub-brand', validation: (r) => r.required() })],
          preview: { select: { title: 'label' }, prepare: ({ title }: { title?: string }) => ({ title: title || 'Sub-brand', subtitle: 'Menu turun berisi semua lini' }) },
        }),
      ],
    }),
    defineField({ name: 'navCtaLabel', title: 'Tombol menu (tulisan)', type: 'string', group: 'navigasi', description: `Bawaan: "${DEFAULT_NAV_CTA.label}". Kosongkan kedua isian untuk memakai bawaan.` }),
    defineField({ name: 'navCtaLink', title: 'Tombol menu (tautan)', type: 'string', group: 'navigasi', description: `Bawaan: ${DEFAULT_NAV_CTA.href}` }),
    defineField({ name: 'footerColSubBrand', title: 'Footer: judul kolom lini', type: 'string', group: 'navigasi', placeholder: DEFAULT_FOOTER_TEXT.colSubBrand }),
    defineField({ name: 'footerColExplore', title: 'Footer: judul kolom tautan', type: 'string', group: 'navigasi', placeholder: DEFAULT_FOOTER_TEXT.colExplore }),
    defineField({
      name: 'footerLinks',
      title: 'Footer: daftar tautan',
      type: 'array',
      group: 'navigasi',
      description: 'Kosongkan untuk memakai daftar bawaan.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerLink',
          fields: [
            defineField({ name: 'label', title: 'Tulisan', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'link', title: 'Tautan', type: 'string', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'link' } },
        }),
      ],
    }),
    defineField({ name: 'footerColContact', title: 'Footer: judul kolom kontak', type: 'string', group: 'navigasi', placeholder: DEFAULT_FOOTER_TEXT.colContact }),
    defineField({ name: 'footerNote', title: 'Footer: kalimat bawah', type: 'string', group: 'navigasi', placeholder: DEFAULT_FOOTER_TEXT.note }),

    // ── Teks halaman lini (sub-brand template) ──
    defineField({
      name: 'subBrandLabels',
      title: 'Judul-judul di setiap halaman lini',
      type: 'object',
      group: 'teks',
      description: 'Berlaku untuk semua halaman lini. Tulis {nama} untuk menyisipkan nama lini. Kosongkan untuk teks bawaan.',
      fields: (Object.keys(DEFAULT_SUBBRAND_LABELS) as (keyof typeof DEFAULT_SUBBRAND_LABELS)[]).map((key) =>
        defineField({
          name: key,
          type: 'string',
          title: {
            aboutEyebrow: 'Label bagian "tentang"',
            aboutTitle: 'Judul bagian "tentang"',
            productsEyebrow: 'Label daftar hidangan',
            productsTitle: 'Judul daftar hidangan',
            orderTitle: 'Judul "cara memesan"',
            faqEyebrow: 'Label FAQ',
            faqTitle: 'Judul FAQ',
            crossSell: 'Label "lini lain"',
          }[key],
          placeholder: DEFAULT_SUBBRAND_LABELS[key],
        }),
      ),
    }),

    // ── Warna (tema) ──
    colorField('colorPrimary', 'Warna utama', 'Judul, menu, footer & latar gelap. Asli: teal ' + THEME_DEFAULTS.primary, 'primary'),
    colorField('colorAccent', 'Warna aksen', 'Tombol "Pesan" & sorotan hangat. Asli: terakota ' + THEME_DEFAULTS.accent, 'accent'),
    colorField('colorHighlight', 'Warna sorotan', 'Aksen kecil (label di footer, garis). Asli: emas ' + THEME_DEFAULTS.highlight),
    colorField('colorBackground', 'Warna latar halaman', 'Kanvas utama situs. Asli: krem ' + THEME_DEFAULTS.background, 'background'),
    colorField('colorText', 'Warna teks', 'Teks paragraf. Asli: cokelat tua ' + THEME_DEFAULTS.text, 'text'),
    colorField('colorSoft', 'Warna lembut', 'Latar lembut (mis. halaman Hadiah). Asli: blush ' + THEME_DEFAULTS.soft),
    colorField('colorFestive', 'Warna perayaan', 'Banner musiman Lebaran/Natal. Asli: merah songket ' + THEME_DEFAULTS.festive),
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
    defineField({
      name: 'markerColor',
      type: 'color',
      title: 'Warna penanda lini',
      description: 'Warna khas lini ini (titik, garis kartu, aksen halaman). Kosongkan untuk warna asli.',
      options: { disableAlpha: true },
    }),
    defineField({
      name: 'channelNote',
      type: 'text',
      rows: 2,
      title: 'Catatan di halaman Pesan',
      description: 'Satu kalimat "kanal mana untuk apa" yang tampil di halaman Pesan.',
    }),
    sectionsField({
      name: 'extraSections',
      title: 'Bagian tambahan di halaman lini',
      description: 'Opsional: tambahkan bagian (foto, teks, FAQ, galeri…) yang tampil di halaman lini ini, sebelum "Mungkin juga cocok".',
    }),
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
  groups: [
    { name: 'susunan', title: 'Susunan halaman', default: true },
    { name: 'seo', title: 'SEO' },
    { name: 'lama', title: 'Format lama' },
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Nama halaman',
      group: 'susunan',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug (alamat halaman)',
      group: 'susunan',
      description: 'Klik "Generate". Halaman akan hidup di /<slug>.',
      options: { source: 'title' },
      // Built-in pages (Beranda, Cerita, …) live at fixed addresses.
      hidden: ({ document }) => isBuiltInPageId(document?._id),
      validation: (r) =>
        r.custom((slug: { current?: string } | undefined, ctx) => {
          if (isBuiltInPageId(ctx.document?._id)) return true;
          if (!slug?.current) return 'Slug wajib diisi.';
          if (RESERVED_SLUGS.includes(slug.current))
            return `"${slug.current}" sudah dipakai halaman bawaan. Pilih alamat lain.`;
          return true;
        }),
    }),
    sectionsField({ group: 'susunan' }),
    defineField({
      name: 'seoTitle',
      type: 'string',
      title: 'Judul SEO (opsional)',
      group: 'seo',
      description: 'Judul di hasil Google & tab browser. Kosongkan untuk memakai nama halaman.',
    }),
    defineField({ name: 'seoDescription', type: 'text', rows: 2, title: 'Deskripsi SEO', group: 'seo' }),
    // Legacy single-block layout (used only when "Susunan halaman" is empty).
    defineField({ name: 'eyebrow', type: 'string', title: 'Label kecil (eyebrow)', group: 'lama' }),
    defineField({ name: 'intro', type: 'text', rows: 3, title: 'Pengantar', group: 'lama' }),
    defineField({ name: 'heroImage', type: 'image', title: 'Foto hero', options: { hotspot: true }, group: 'lama' }),
    defineField({ name: 'body', type: 'blockContent', title: 'Isi halaman', group: 'lama' }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', id: '_id', sections: 'sections' },
    prepare: ({ title, slug, id, sections }: { title?: string; slug?: string; id?: string; sections?: unknown[] }) => {
      const key = id?.replace(/^drafts\./, '').replace(/^page-/, '') as keyof typeof BUILT_IN_PAGES;
      const builtIn = isBuiltInPageId(id) ? BUILT_IN_PAGES[key] : undefined;
      return {
        title: title || builtIn?.title || '(tanpa nama)',
        subtitle: `${builtIn ? builtIn.path : `/${slug ?? ''}`} · ${sections?.length ?? 0} bagian`,
      };
    },
  },
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
  ...SECTION_TYPES,
];
