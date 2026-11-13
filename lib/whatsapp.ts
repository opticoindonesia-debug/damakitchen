import { WHATSAPP_NUMBER } from '@/content/channels';

/**
 * WhatsApp deep-link builder (§9).
 * Returns https://wa.me/<E164_NO_PLUS>?text=<encoded>.
 *
 * Templates stay warm and on-voice (§5 kill rules apply to outbound too):
 * at most one emoji, never caps-lock, never fake urgency.
 */
export function buildWaLink(message: string, number?: string): string {
  const n = (number || WHATSAPP_NUMBER).replace(/[^0-9]/g, '');
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

/** General product order. */
export function waOrder(produk: string, number?: string): string {
  return buildWaLink(`Halo DAMA 🙂 saya ingin pesan ${produk}. Boleh dibantu?`, number);
}

/** WARISAN heritage pre-order. */
export function waPreorder(hidangan: string, tanggal = '{tanggal}', number?: string): string {
  return buildWaLink(`Halo DAMA, saya mau pre-order ${hidangan} untuk tanggal ${tanggal}. Terima kasih.`, number);
}

export interface CateringInquiry {
  jenis: string;
  tanggal: string;
  pax: string;
  kemasan: string;
  lokasi: string;
  budget: string;
  catatan: string;
}

/** Catering quotation built from the inquiry form (§7.5). */
export function waCatering(i: CateringInquiry, number?: string): string {
  const lines = [
    'Halo DAMA, saya ingin minta penawaran acara.',
    `Acara: ${i.jenis || '-'}`,
    `Tanggal: ${i.tanggal || '-'}`,
    `Jumlah: ${i.pax || '-'} pax`,
    `Kemasan: ${i.kemasan || '-'}`,
    `Lokasi: ${i.lokasi || '-'}`,
    `Budget: ${i.budget || '-'}`,
    `Catatan: ${i.catatan || '-'}`,
  ];
  return buildWaLink(lines.join('\n'), number);
}

export interface GiftingInquiry {
  paket: string;
  jumlah: string;
  tanggal: string;
  pesan: string;
  catatan: string;
}

/** Gifting / corporate quotation built from the inquiry form (§7.6). */
export function waGifting(i: GiftingInquiry, number?: string): string {
  const lines = [
    'Halo DAMA, saya ingin mengirim hadiah.',
    `Paket: ${i.paket || '-'}`,
    `Jumlah: ${i.jumlah || '-'}`,
    `Tanggal kirim: ${i.tanggal || '-'}`,
    `Pesan kartu: ${i.pesan || '-'}`,
    `Catatan: ${i.catatan || '-'}`,
  ];
  return buildWaLink(lines.join('\n'), number);
}
