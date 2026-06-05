import type { ChannelId } from './channels';

/**
 * The five sub-brands (§5.2, §7.3). Each carries ONE marker color and ONE
 * fixed emotion + lead message. Emotions are never swapped between lines.
 */

export type SubBrandSlug =
  | 'lamak-dama'
  | 'warisan-dama'
  | 'hidang-basamo'
  | 'dama-kapau'
  | 'tando-mato';

export interface SubBrandFaq {
  q: string;
  a: string;
}

export interface SubBrand {
  slug: SubBrandSlug;
  /** Display name, e.g. "LAMAK DAMA". */
  name: string;
  /** Short line name without DAMA, used in tags. */
  shortName: string;
  /** The single carried emotion — do not change. */
  emotion: string;
  /** Approved lead message (§5.2) — verbatim. */
  lead: string;
  /** Tailwind marker token name (text-marker-xxx / bg-marker-xxx). */
  marker: 'lamak' | 'warisan' | 'hidang' | 'kapau' | 'tando';
  /** Marker hex, used to set the per-page --accent CSS variable. */
  markerHex: string;
  /** One-paragraph "what it is / who it's for" (calm, no persona jargon). */
  about: string;
  /** Ordered channels this line routes to. First = primary. */
  channels: ChannelId[];
  /** How-to-order guidance shown above the channel buttons. */
  howToOrder: string;
  faqs: SubBrandFaq[];
  /** Sibling slugs for the gentle cross-sell strip. */
  crossSell: SubBrandSlug[];
  /** Real hero photo path. When set, renders via next/image. TODO: add asset. */
  heroImage?: string;
}

export const subBrands: Record<SubBrandSlug, SubBrand> = {
  'lamak-dama': {
    slug: 'lamak-dama',
    name: 'LAMAK DAMA',
    shortName: 'LAMAK',
    emotion: 'Tenang',
    lead: 'Tinggal panaskan — rasa rumah yang konsisten, tanpa khawatir.',
    marker: 'lamak',
    markerHex: '#1F7A6E',
    about:
      'Masakan Minang beku siap panas untuk hari-hari yang sibuk. Dimasak matang, dibekukan dengan hati-hati, dan dikirim aman supaya rasa rumah selalu ada di freezer Anda. Cocok untuk yang ingin makan tenang tanpa repot.',
    channels: ['shopee', 'tiktok', 'whatsapp'],
    howToOrder:
      'Tersedia di Shopee dan TikTok Shop. Untuk pertanyaan atau pesanan khusus, sapa kami lewat WhatsApp.',
    faqs: [
      {
        q: 'Bagaimana cara memanaskannya?',
        a: 'Cukup panaskan dalam panci dengan api kecil, atau microwave hingga hangat merata. Petunjuk lengkap selalu kami sertakan di kemasan.',
      },
      {
        q: 'Berapa lama masa simpannya?',
        a: 'Selama beku dalam freezer, kualitas terjaga hingga beberapa bulan. Setelah dipanaskan, sebaiknya langsung dinikmati.',
      },
      {
        q: 'Apakah halal?',
        a: 'Ya. Seluruh bahan dipilih halal dan diolah di dapur kami sendiri.',
      },
      {
        q: 'Apakah sambal terpisah?',
        a: 'Untuk varian tertentu, sambal kami kemas terpisah agar Anda bisa mengatur tingkat pedas sesuai selera.',
      },
      {
        q: 'Bagaimana pengirimannya?',
        a: 'Kami kemas aman dengan ice gel dan kemasan tahan suhu untuk pengiriman frozen. Sampai dalam kondisi tetap beku.',
      },
    ],
    crossSell: ['warisan-dama', 'dama-kapau'],
  },

  'warisan-dama': {
    slug: 'warisan-dama',
    name: 'WARISAN DAMA',
    shortName: 'WARISAN',
    emotion: 'Bangga',
    lead: 'Rasa kampung yang dibuat fresh — keaslian yang layak dijaga.',
    marker: 'warisan',
    markerHex: '#9E3F22',
    about:
      'Hidangan warisan yang dimasak segar by order — resep kampung yang dijaga keasliannya, disajikan hangat. Untuk Anda yang ingin merasakan masakan Minang sebagaimana mestinya, dengan bangga.',
    channels: ['whatsapp'],
    howToOrder:
      'Dibuat fresh, jadi kami melayani lewat pre-order WhatsApp. Sampaikan menu dan tanggalnya, kami siapkan dengan sepenuh hati.',
    faqs: [
      {
        q: 'Kenapa harus pre-order?',
        a: 'Karena setiap hidangan dimasak fresh saat dipesan, bukan stok beku. Pre-order membuat kami bisa menjaga kesegaran dan kualitasnya.',
      },
      {
        q: 'Berapa lama hidangan ini bertahan?',
        a: 'Paling nikmat disantap di hari yang sama. Jika perlu disimpan, dinginkan dan hangatkan kembali keesokan harinya.',
      },
      {
        q: 'Apakah halal?',
        a: 'Ya. Semua bahan halal dan diolah di dapur kami sendiri.',
      },
      {
        q: 'Apakah pedasnya bisa disesuaikan?',
        a: 'Bisa. Sampaikan preferensi pedas Anda saat memesan, kami sesuaikan sebisanya.',
      },
    ],
    crossSell: ['lamak-dama', 'dama-kapau'],
  },

  'hidang-basamo': {
    slug: 'hidang-basamo',
    name: 'HIDANG BASAMO',
    shortName: 'HIDANG',
    emotion: 'Hangat',
    lead: 'Kami yang masak & beres-beres, Anda yang hadir penuh.',
    marker: 'hidang',
    markerHex: '#B5792B',
    about:
      'Layanan masak di tempat untuk acara di rumah Anda. Kami yang menyiapkan, menyajikan, dan membereskan — supaya Anda bisa benar-benar hadir bersama tamu, hangat dan tanpa beban.',
    channels: ['whatsapp'],
    howToOrder:
      'Setiap acara berbeda, jadi kami mulai dari obrolan. Isi formulir penawaran dan kami lanjutkan lewat WhatsApp.',
    faqs: [
      {
        q: 'Untuk berapa banyak tamu?',
        a: 'Kami melayani acara mulai dari skala kecil di rumah hingga sekitar 200 tamu. Sampaikan jumlahnya saat berdiskusi.',
      },
      {
        q: 'Apa saja yang termasuk?',
        a: 'Penyiapan masakan, penyajian, peralatan saji, hingga beres-beres setelah acara. Detailnya kami sesuaikan dengan kebutuhan Anda.',
      },
      {
        q: 'Apakah bisa pilih menu sendiri?',
        a: 'Tentu. Kami bantu susun menu sesuai acara, jumlah tamu, dan selera Anda.',
      },
      {
        q: 'Seberapa jauh area layanannya?',
        a: 'Saat ini kami fokus melayani area Jabodetabek. Untuk lokasi lain, mari kita bicarakan.',
      },
    ],
    crossSell: ['dama-kapau', 'tando-mato'],
  },

  'dama-kapau': {
    slug: 'dama-kapau',
    name: 'DAMA KAPAU',
    shortName: 'KAPAU',
    emotion: 'Lega',
    lead: 'Porsi individu yang tetap terasa diniatkan — harian maupun acara.',
    marker: 'kapau',
    markerHex: '#5E7B52',
    about:
      'Nasi kapau dalam porsi individu — praktis untuk makan harian maupun acara. Setiap kotak tetap kami siapkan dengan niat, supaya Anda bisa makan dengan lega, kapan pun.',
    channels: ['gofood', 'grab', 'whatsapp'],
    howToOrder:
      'Untuk pesanan harian, temukan kami di GoFood dan GrabFood. Untuk pesanan jumlah banyak atau acara, hubungi kami lewat WhatsApp.',
    faqs: [
      {
        q: 'Berapa porsi tiap kotak?',
        a: 'Setiap kotak dirancang untuk satu porsi individu yang mengenyangkan.',
      },
      {
        q: 'Apakah bisa pesan banyak untuk acara?',
        a: 'Bisa. Untuk pesanan jumlah besar, hubungi kami lewat WhatsApp agar bisa kami siapkan tepat waktu.',
      },
      {
        q: 'Apakah halal?',
        a: 'Ya. Seluruh bahan halal dan diolah di dapur kami sendiri.',
      },
      {
        q: 'Apakah sambal terpisah?',
        a: 'Untuk format tertentu, sambal kami pisah agar tetap segar dan bisa Anda atur sendiri.',
      },
    ],
    crossSell: ['hidang-basamo', 'lamak-dama'],
  },

  'tando-mato': {
    slug: 'tando-mato',
    name: 'TANDO MATO',
    shortName: 'TANDO MATO',
    emotion: 'Berkesan',
    lead: 'Kirim rasa sayang, bukan sekadar makanan.',
    marker: 'tando',
    markerHex: '#B86B74',
    about:
      'Hampers masakan Minang untuk momen yang berkesan — dari hadiah personal hingga corporate gifting. Dirangkai rapi, dilengkapi kartu, supaya yang Anda kirim terasa sebagai tando mato: tanda mata yang tulus.',
    channels: ['shopee', 'whatsapp'],
    howToOrder:
      'Paket musiman tersedia di Shopee. Untuk hampers custom atau corporate, mari rancang bersama lewat WhatsApp.',
    faqs: [
      {
        q: 'Apa saja pilihan paketnya?',
        a: 'Mulai dari Si Ketek untuk satu orang hingga Si Gadang untuk dinikmati bersama. Detail tiap tier ada di halaman Hadiah.',
      },
      {
        q: 'Apakah bisa menyertakan kartu ucapan?',
        a: 'Bisa. Kami sertakan kartu dengan pesan tulisan tangan sesuai pesan yang Anda titipkan.',
      },
      {
        q: 'Apakah melayani corporate gifting?',
        a: 'Ya. Untuk pesanan corporate dalam jumlah banyak, kami bantu rancang paket dan pengirimannya.',
      },
      {
        q: 'Berapa lama masa simpannya?',
        a: 'Tergantung isi paket. Setiap hampers kami lengkapi keterangan masa simpan dan cara penyajiannya.',
      },
    ],
    crossSell: ['hidang-basamo', 'warisan-dama'],
  },
};

export const subBrandList: SubBrand[] = [
  subBrands['lamak-dama'],
  subBrands['warisan-dama'],
  subBrands['hidang-basamo'],
  subBrands['dama-kapau'],
  subBrands['tando-mato'],
];
