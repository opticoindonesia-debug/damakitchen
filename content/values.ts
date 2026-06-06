/**
 * The five brand values (§7.2), expanded on the Story page.
 */

export interface BrandValue {
  title: string;
  desc: string;
}

export const values: BrandValue[] = [
  {
    title: 'Disiplin Tanpa Kompromi',
    desc: 'Standar yang kami pegang tidak berubah, baik untuk satu porsi maupun seratus.',
  },
  {
    title: 'Ketulusan',
    desc: 'Kami memasak seperti memasak untuk keluarga sendiri — dengan niat, bukan sekadar pesanan.',
  },
  {
    title: 'Kejujuran',
    desc: 'Tentang bahan, porsi, dan apa yang kami janjikan. Tanpa dibesar-besarkan.',
  },
  {
    title: 'Kegigihan dalam Detail',
    desc: 'Rasa yang konsisten lahir dari hal-hal kecil yang dikerjakan dengan sungguh-sungguh.',
  },
  {
    title: 'Kasih Sayang',
    desc: 'Inti dari semuanya: membuat siapa pun yang menikmatinya taraso disayang.',
  },
];
