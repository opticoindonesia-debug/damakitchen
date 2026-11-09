/**
 * Seeds the 7 built-in pages as page-builder sections that reproduce the
 * current coded layouts exactly, so editors start from today's site.
 *
 * Beranda reuses anything already edited in Pengaturan Situs (headline, hero
 * photo, background style, motif, founder quote/photo) so no edit is lost.
 */
import { site } from '../content/site';
import { founder, proverbMovements, enjoyModes } from '../content/story';
import { builtInPageId, BUILT_IN_PAGES, type BuiltInPageKey } from '../lib/pages';
import type { SeedDoc } from './seedData';

type Settings = Record<string, unknown> | null | undefined;
type Block = Record<string, unknown>;

const str = (v: unknown, fallback: string) => (typeof v === 'string' && v.trim() ? v : fallback);

function keyed(prefix: string) {
  let n = 0;
  return () => `${prefix}-${++n}`;
}

const btn = (k: () => string, label: string, link: string, style: 'primary' | 'secondary' = 'primary') => ({
  _key: k(),
  _type: 'button',
  label,
  link,
  style,
});

function page(key: BuiltInPageKey, sections: Block[]): SeedDoc {
  return {
    _id: builtInPageId(key),
    _type: 'page',
    title: BUILT_IN_PAGES[key].title,
    sections,
  };
}

function beranda(s: Settings): SeedDoc {
  const k = keyed('beranda');
  const heroBgMap: Record<string, string> = { teal: 'primary', blush: 'soft' };
  const heroBg = heroBgMap[s?.heroStyle as string] ?? 'cream';
  const motif = str(s?.backgroundMotif, 'songket-geometric');
  return page('beranda', [
    {
      _key: k(),
      _type: 'heroSection',
      eyebrow: str(s?.brandLineEn, site.brandLineEn),
      heading: str(s?.heroHeadline, `${site.tagline}.`),
      text: str(s?.umbrellaPromise, site.umbrellaPromise),
      buttons: [btn(k, 'Pesan', '/pesan'), btn(k, 'Lihat Menu', '/menu', 'secondary')],
      ...(s?.heroImage ? { image: s.heroImage } : {}),
      imagePosition: 'right',
      imageRatio: 'square',
      headingSize: 'xlarge',
      background: heroBg,
      motif,
      ...(s?.motifImage ? { motifImage: s.motifImage } : {}),
      motifOpacity: typeof s?.motifOpacity === 'number' ? s.motifOpacity : 5,
      spacing: 'normal',
    },
    {
      _key: k(),
      _type: 'quoteSection',
      quote: str(s?.essence, 'Masakan bukan sekadar makanan — ia sarana merawat hubungan.'),
      background: 'cream',
    },
    {
      _key: k(),
      _type: 'dataSection',
      source: 'pillars',
      eyebrow: 'Yang kami pegang',
      heading: 'Empat hal yang tak kami tawar',
      intro: 'Setiap hidangan DAMA lahir dari empat keyakinan yang sama.',
      dividerAbove: true,
    },
    {
      _key: k(),
      _type: 'dataSection',
      source: 'subBrands',
      eyebrow: 'Lini DAMA',
      heading: 'Satu hati, beragam cara menikmati',
      intro: 'Masing-masing membawa suasana yang berbeda, namun voice-nya satu: hangat dan tulus.',
      dividerAbove: true,
    },
    {
      _key: k(),
      _type: 'quoteSection',
      quote: str(s?.founderQuote, founder.pullQuote),
      attribution: `${str(s?.founderName, founder.name)}, ${str(s?.founderRole, founder.role)}`,
      ...(s?.founderImage ? { image: s.founderImage } : {}),
      layout: 'withImage',
      imagePosition: 'left',
      buttons: [btn(k, 'Baca cerita kami →', '/cerita', 'secondary')],
      background: 'deep',
    },
    {
      _key: k(),
      _type: 'cardsSection',
      eyebrow: 'Taraso Disayang',
      heading: 'Cara menikmati DAMA',
      intro: 'Untuk diri sendiri, bersama keluarga, atau sebagai pemberian — DAMA hadir di setiap momen.',
      cards: enjoyModes.map((m) => ({ _key: k(), _type: 'card', title: m.title, text: m.desc })),
      columns: 3,
      cardStyle: 'image',
    },
    {
      _key: k(),
      _type: 'dataSection',
      source: 'testimonials',
      eyebrow: 'Kata mereka',
      heading: 'Cerita dari yang sudah mencoba',
    },
    {
      _key: k(),
      _type: 'dataSection',
      source: 'channels',
      eyebrow: 'Di mana memesan',
      heading: 'Temukan DAMA di kanal favorit Anda',
      intro: 'Kami hadir di tempat Anda biasa berbelanja. Pilih kanal yang paling nyaman.',
      dividerAbove: true,
    },
    {
      _key: k(),
      _type: 'ctaSection',
      spacing: 'compact',
      panels: [
        {
          _key: k(),
          _type: 'ctaPanel',
          heading: 'Punya acara?',
          text: 'Kami yang masak dan beres-beres, Anda yang hadir penuh bersama tamu.',
          buttonLabel: 'Minta penawaran acara',
          link: '/katering',
          tone: 'primary',
        },
        {
          _key: k(),
          _type: 'ctaPanel',
          heading: 'Ingin memberi?',
          text: 'Kirim rasa sayang lewat hampers yang dirangkai dengan hati.',
          buttonLabel: 'Kirim sebagai hadiah',
          link: '/hadiah',
          tone: 'accent',
        },
      ],
    },
  ]);
}

function cerita(s: Settings): SeedDoc {
  const k = keyed('cerita');
  return page('cerita', [
    {
      _key: k(),
      _type: 'heroSection',
      eyebrow: 'Cerita kami',
      heading: 'Bermula dari dapur, untuk yang disayang',
      text: founder.truth.join('\n\n'),
      ...(s?.founderImage ? { image: s.founderImage } : {}),
      imagePosition: 'right',
      imageRatio: 'portrait',
      headingSize: 'large',
    },
    {
      _key: k(),
      _type: 'quoteSection',
      quote: str(s?.founderQuote, founder.pullQuote),
      attribution: `${founder.name}, ${founder.role}`,
      spacing: 'compact',
    },
    {
      _key: k(),
      _type: 'cardsSection',
      eyebrow: 'Akar kami',
      heading: 'Dari Mato Turun Ka Paruik',
      intro:
        'Peribahasa Minang yang menjadi inti DAMA — apa yang dilihat dan dirasakan, turun menjadi niat, lalu menjadi masakan.',
      cards: proverbMovements.map((m) => ({ _key: k(), _type: 'card', title: m.title, text: m.desc })),
      columns: 3,
      cardStyle: 'numbered',
      dividerAbove: true,
    },
    {
      _key: k(),
      _type: 'dataSection',
      source: 'pillars',
      eyebrow: 'Yang kami pegang',
      heading: 'Empat pilar DAMA',
      background: 'deep',
    },
    {
      _key: k(),
      _type: 'dataSection',
      source: 'values',
      eyebrow: 'Cara kami bekerja',
      heading: 'Lima nilai yang kami jaga',
    },
    {
      _key: k(),
      _type: 'quoteSection',
      quote: site.umbrellaPromise,
      buttons: [btn(k, 'Lihat menu', '/menu', 'secondary'), btn(k, 'Pesan', '/pesan')],
      dividerAbove: true,
    },
  ]);
}

function menu(): SeedDoc {
  const k = keyed('menu');
  return page('menu', [
    {
      _key: k(),
      _type: 'dataSection',
      source: 'menu',
      eyebrow: 'Menu',
      heading: 'Seluruh hidangan DAMA',
      intro:
        'Dikelompokkan per lini. Saring sesuai suasana yang Anda cari, lalu pesan lewat kanal yang tersedia.',
    },
  ]);
}

function katering(): SeedDoc {
  const k = keyed('katering');
  return page('katering', [
    {
      _key: k(),
      _type: 'heroSection',
      eyebrow: 'Katering & Acara',
      heading: 'Kami yang masak & beres-beres, Anda yang hadir penuh',
      text:
        'Untuk acara di rumah maupun perayaan yang lebih besar, Anda bisa benar-benar menemani tamu tanpa repot urusan dapur — kami yang masak dan beres-beres.',
      imagePosition: 'right',
      imageRatio: 'landscape',
      background: 'deep',
    },
    {
      _key: k(),
      _type: 'cardsSection',
      eyebrow: 'Pilihan format',
      heading: 'Sesuai bentuk acara Anda',
      cards: [
        ['Prasmanan', 'Penyajian penuh untuk acara di rumah atau gedung, lengkap dengan peralatan saji.'],
        ['Besek / Bento / Box', 'Porsi individu yang rapi untuk dibagikan — praktis dan tetap terasa diniatkan.'],
        ['10–200 pax', 'Skala kecil hingga acara besar, dengan standar dan porsi yang terjaga.'],
      ].map(([title, text]) => ({ _key: k(), _type: 'card', title, text })),
      columns: 3,
      cardStyle: 'plain',
    },
    {
      _key: k(),
      _type: 'featuresSection',
      heading: 'Yang bisa Anda andalkan',
      items: [
        ['Tepat waktu', 'Kami datang dan siap sesuai jadwal yang disepakati.'],
        ['Porsi terjamin', 'Jumlah dan porsi sesuai kesepakatan, tanpa kejutan.'],
        ['Beres-beres', 'Setelah acara, kami rapikan — Anda tinggal menikmati momennya.'],
      ].map(([title, text]) => ({ _key: k(), _type: 'feature', icon: 'none', title, text })),
      columns: 3,
      background: 'primary',
    },
    {
      _key: k(),
      _type: 'formSection',
      variant: 'catering',
      eyebrow: 'Mulai dari obrolan',
      heading: 'Minta penawaran acara',
      intro: 'Ceritakan sedikit tentang acara Anda. Kami siapkan penawaran dan lanjutkan lewat WhatsApp.',
    },
  ]);
}

function hadiah(): SeedDoc {
  const k = keyed('hadiah');
  return page('hadiah', [
    {
      _key: k(),
      _type: 'heroSection',
      eyebrow: 'TANDO MATO · Hadiah',
      heading: 'Kirim rasa sayang, bukan sekadar makanan',
      text:
        'Hampers masakan Minang yang dirangkai rapi dan dilengkapi kartu — supaya yang Anda kirim terasa sebagai tando mato: tanda mata yang tulus.',
      imagePosition: 'right',
      imageRatio: 'landscape',
      background: 'soft',
      motif: 'bunga-floral',
      motifOpacity: 7,
    },
    { _key: k(), _type: 'dataSection', source: 'seasonalBanner' },
    {
      _key: k(),
      _type: 'dataSection',
      source: 'giftTiers',
      eyebrow: 'Pilihan paket',
      heading: 'Dari Si Ketek hingga Si Gadang',
      anchor: 'paket',
    },
    {
      _key: k(),
      _type: 'featuresSection',
      items: [
        {
          _key: k(),
          _type: 'feature',
          icon: 'none',
          title: 'Corporate gifting',
          text:
            'Untuk pemberian dalam jumlah banyak, kami bantu rancang paket, kartu, dan pengiriman — supaya setiap penerima merasa benar-benar diperhatikan.',
          linkLabel: 'Pesan lewat WhatsApp',
          link: 'whatsapp',
        },
        {
          _key: k(),
          _type: 'feature',
          icon: 'none',
          title: 'Kartu tulisan tangan',
          text:
            'Titipkan pesan Anda, kami tuliskan dengan tangan dan sertakan di dalam hampers. Sentuhan kecil yang membuat momen lebih berkesan.',
        },
      ],
      columns: 2,
      background: 'deep',
    },
    {
      _key: k(),
      _type: 'formSection',
      variant: 'gifting',
      eyebrow: 'Rancang bersama',
      heading: 'Kirim sebagai hadiah',
      intro: 'Ceritakan paket dan momen yang Anda tuju. Untuk paket musiman, tersedia juga di Shopee.',
      asideHeading: 'Lebih suka langsung?',
      asideText: `Paket musiman ${site.tagline} tersedia di Shopee.`,
      asideChannels: ['shopee', 'whatsapp'],
    },
  ]);
}

function pesan(): SeedDoc {
  const k = keyed('pesan');
  return page('pesan', [
    {
      _key: k(),
      _type: 'dataSection',
      source: 'channelMatrix',
      eyebrow: 'Di mana memesan',
      heading: 'Pilih kanal sesuai kebutuhan',
      intro:
        'Setiap lini punya kanal yang paling pas. Berikut panduan singkatnya — pilih yang paling nyaman untuk Anda.',
    },
  ]);
}

function kontak(): SeedDoc {
  const k = keyed('kontak');
  return page('kontak', [
    {
      _key: k(),
      _type: 'dataSection',
      source: 'contact',
      eyebrow: 'Kontak',
      heading: 'Senang bisa menyapa Anda',
      intro:
        'Cara tercepat menghubungi kami adalah lewat WhatsApp. Bisa juga lewat email atau media sosial.',
    },
  ]);
}

/** All built-in page seeds. Pass the current siteSettings doc to carry over edits. */
export function buildPageSeeds(settings?: Settings): SeedDoc[] {
  return [beranda(settings), cerita(settings), menu(), katering(), hadiah(), pesan(), kontak()];
}
