/**
 * Founder truth + heritage narrative (§7.2). Used on Home (teaser) and Cerita.
 */

export const founder = {
  name: 'Aninditya Damayanti',
  role: 'Pendiri DAMA KITCHEN',
  pullQuote:
    'Saya tumbuh dengan keyakinan sederhana: masakan adalah cara kita merawat orang yang kita sayang.',
  truth: [
    'DAMA lahir dari dapur keluarga — dari kebiasaan memasak bukan untuk berjualan, tapi untuk membuat orang di sekeliling merasa diperhatikan.',
    'Dari situ tumbuh keinginan untuk menjaga rasa Minang yang otentik, lalu membagikannya kepada lebih banyak orang tanpa kehilangan kehangatannya.',
  ],
};

/** "Dari Mato Turun Ka Paruik" — explained in three movements (§7.2). */
export const proverbMovements = [
  {
    title: 'Akar',
    desc: 'Rasa yang berakar pada tradisi Minang — diwariskan, bukan ditemukan kemarin.',
  },
  {
    title: 'Hati',
    desc: 'Dari mata turun ke hati: apa yang dilihat dan dirasakan menjadi niat memasak.',
  },
  {
    title: 'Niat',
    desc: 'Niat itu turun ke perut — menjadi masakan yang membuat taraso disayang.',
  },
];

/** The three ways to enjoy DAMA, tied to the big idea (§7.1). */
export const enjoyModes = [
  {
    title: 'Untuk diri sendiri',
    desc: 'Rasa rumah yang menenangkan di tengah hari yang sibuk.',
    category: 'lifestyle' as const,
  },
  {
    title: 'Bersama keluarga',
    desc: 'Hidangan yang mengumpulkan, dari meja harian hingga acara besar.',
    category: 'lifestyle' as const,
  },
  {
    title: 'Memberi',
    desc: 'Mengirim rasa sayang sebagai hadiah yang berkesan.',
    category: 'product' as const,
  },
];
