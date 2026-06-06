import type { SubBrandSlug } from './subbrands';

/**
 * Product catalog (§7.4). Seeded with the dishes named in the strategy.
 * Prices are intentionally omitted — TODO: add real prices when confirmed.
 */

export type ProductInfo = 'halal' | 'pedas' | 'sambal-terpisah' | 'porsi';

export interface Product {
  id: string;
  name: string;
  /** Short, honest one-liner — no superlatives (§5.1). */
  blurb: string;
  subBrand: SubBrandSlug;
  /** Relevant info icons to surface on the card. */
  info: ProductInfo[];
  /** TODO: real price. Kept null until confirmed. */
  price: number | null;
  /** Placeholder image category folder. TODO: real product photo. */
  imageCategory: 'food' | 'product' | 'ingredients' | 'process' | 'lifestyle';
  /**
   * Real photo path, e.g. "/images/food/rendang.jpg". When set, the card
   * renders it via next/image; until then a warm placeholder stands in.
   * TODO: add real product photos and set this.
   */
  image?: string;
}

export const products: Product[] = [
  // ── LAMAK DAMA (frozen, siap panas) ─────────────────────────
  {
    id: 'lamak-rendang',
    name: 'Rendang',
    blurb: 'Daging yang dimasak perlahan hingga bumbunya meresap, beku siap panas.',
    subBrand: 'lamak-dama',
    info: ['halal', 'pedas', 'porsi'],
    price: null,
    imageCategory: 'food',
  },
  {
    id: 'lamak-kalio',
    name: 'Kalio',
    blurb: 'Rendang muda yang lebih basah dan lembut, untuk yang suka kuah berbumbu.',
    subBrand: 'lamak-dama',
    info: ['halal', 'porsi'],
    price: null,
    imageCategory: 'food',
  },
  {
    id: 'lamak-dendeng',
    name: 'Dendeng',
    blurb: 'Irisan daging tipis berbumbu, gurih dan tahan untuk stok di freezer.',
    subBrand: 'lamak-dama',
    info: ['halal', 'pedas'],
    price: null,
    imageCategory: 'food',
  },
  {
    id: 'lamak-gulai',
    name: 'Gulai',
    blurb: 'Kuah santan berbumbu khas Minang, hangat menemani nasi.',
    subBrand: 'lamak-dama',
    info: ['halal', 'porsi'],
    price: null,
    imageCategory: 'food',
  },
  {
    id: 'lamak-sambal',
    name: 'Sambal Series',
    blurb: 'Rangkaian sambal khas, dikemas terpisah agar pedasnya bisa Anda atur.',
    subBrand: 'lamak-dama',
    info: ['halal', 'pedas', 'sambal-terpisah'],
    price: null,
    imageCategory: 'ingredients',
  },

  // ── WARISAN DAMA (heritage, fresh by order) ────────────────
  {
    id: 'warisan-sala-lauak',
    name: 'Sala Lauak',
    blurb: 'Gorengan tepung beras berbumbu ikan, renyah di luar lembut di dalam.',
    subBrand: 'warisan-dama',
    info: ['halal'],
    price: null,
    imageCategory: 'food',
  },
  {
    id: 'warisan-bubur-kampiun',
    name: 'Bubur Kampiun',
    blurb: 'Perpaduan bubur dan kolak manis, kehangatan kampung dalam semangkuk.',
    subBrand: 'warisan-dama',
    info: ['halal'],
    price: null,
    imageCategory: 'food',
  },
  {
    id: 'warisan-soto-padang',
    name: 'Soto Padang',
    blurb: 'Kuah bening berempah dengan daging dan perkedel, disajikan hangat.',
    subBrand: 'warisan-dama',
    info: ['halal', 'pedas'],
    price: null,
    imageCategory: 'food',
  },
  {
    id: 'warisan-katupek',
    name: 'Katupek',
    blurb: 'Ketupat sayur khas Minang dengan kuah gulai nangka yang gurih.',
    subBrand: 'warisan-dama',
    info: ['halal'],
    price: null,
    imageCategory: 'food',
  },
  {
    id: 'warisan-nasi-goreng',
    name: 'Nasi Goreng',
    blurb: 'Nasi goreng berbumbu rumahan, dimasak segar saat dipesan.',
    subBrand: 'warisan-dama',
    info: ['halal', 'pedas'],
    price: null,
    imageCategory: 'food',
  },
  {
    id: 'warisan-mie-goreng',
    name: 'Mie Goreng',
    blurb: 'Mie goreng dengan bumbu yang nendang, fresh dari wajan.',
    subBrand: 'warisan-dama',
    info: ['halal', 'pedas'],
    price: null,
    imageCategory: 'food',
  },
  {
    id: 'warisan-nasi-bakar',
    name: 'Nasi Bakar',
    blurb: 'Nasi berbumbu dibungkus daun dan dibakar hingga harum.',
    subBrand: 'warisan-dama',
    info: ['halal'],
    price: null,
    imageCategory: 'food',
  },
  {
    id: 'warisan-nasi-dendeng-crispy',
    name: 'Nasi Dendeng Crispy',
    blurb: 'Nasi hangat dengan dendeng crispy yang renyah dan berbumbu.',
    subBrand: 'warisan-dama',
    info: ['halal', 'pedas'],
    price: null,
    imageCategory: 'food',
  },

  // ── DAMA KAPAU (box formats, individual portions) ──────────
  {
    id: 'kapau-besek',
    name: 'Besek Kapau',
    blurb: 'Nasi kapau dalam besek tradisional, porsi individu yang mengenyangkan.',
    subBrand: 'dama-kapau',
    info: ['halal', 'porsi'],
    price: null,
    imageCategory: 'product',
  },
  {
    id: 'kapau-bento',
    name: 'Bento Kapau',
    blurb: 'Format bento praktis untuk makan harian maupun acara.',
    subBrand: 'dama-kapau',
    info: ['halal', 'porsi', 'sambal-terpisah'],
    price: null,
    imageCategory: 'product',
  },
  {
    id: 'kapau-box',
    name: 'Box Kapau',
    blurb: 'Kotak nasi kapau lengkap, rapi dan siap dibagikan.',
    subBrand: 'dama-kapau',
    info: ['halal', 'porsi'],
    price: null,
    imageCategory: 'product',
  },

  // ── TANDO MATO (hampers tiers) ─────────────────────────────
  {
    id: 'tando-si-ketek',
    name: 'Si Ketek',
    blurb: 'Hampers mungil untuk satu orang — tanda mata yang manis dan tulus.',
    subBrand: 'tando-mato',
    info: ['halal'],
    price: null,
    imageCategory: 'product',
  },
  {
    id: 'tando-si-sedang',
    name: 'Si Sedang',
    blurb: 'Paket sedang untuk dinikmati berdua atau bertiga.',
    subBrand: 'tando-mato',
    info: ['halal'],
    price: null,
    imageCategory: 'product',
  },
  {
    id: 'tando-si-gadang',
    name: 'Si Gadang',
    blurb: 'Hampers besar untuk 5–8 orang — kehangatan yang dibagi bersama.',
    subBrand: 'tando-mato',
    info: ['halal'],
    price: null,
    imageCategory: 'product',
  },
];

export function productsBySubBrand(slug: SubBrandSlug): Product[] {
  return products.filter((p) => p.subBrand === slug);
}
