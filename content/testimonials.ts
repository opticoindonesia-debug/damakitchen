/**
 * Testimonials (§8). Honest, real-voice — customers have names, not "users".
 * TODO: replace placeholders with real, consented testimonials.
 */

export interface Testimonial {
  name: string;
  context: string;
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    name: 'Rina', // TODO: real testimonial
    context: 'Pelanggan LAMAK DAMA',
    quote:
      'Sekarang freezer saya selalu ada rendang DAMA. Tinggal panaskan, rasanya seperti masakan rumah.',
  },
  {
    name: 'Pak Hendra', // TODO: real testimonial
    context: 'Acara keluarga, katering DAMA',
    quote:
      'Kami benar-benar bisa menemani tamu. Semua urusan masak dan beres-beres ditangani dengan rapi.',
  },
  {
    name: 'Sari', // TODO: real testimonial
    context: 'Corporate gifting, TANDO MATO',
    quote:
      'Hampers-nya rapi dan terasa personal. Penerima merasa benar-benar diperhatikan.',
  },
];
