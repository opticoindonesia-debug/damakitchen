/**
 * The four brand pillars (§5.3). Rendered as a 4-up line-icon row.
 */

export type PillarIcon = 'recipe' | 'care' | 'ingredients' | 'love';

export interface Pillar {
  title: string;
  desc: string;
  icon: PillarIcon;
}

export const pillars: Pillar[] = [
  {
    title: 'Authentic Recipes',
    desc: 'Resep Minang yang dijaga keasliannya, diwariskan dengan teliti.',
    icon: 'recipe',
  },
  {
    title: 'Made with Care',
    desc: 'Dimasak perlahan dan penuh perhatian, bukan sekadar diproduksi.',
    icon: 'care',
  },
  {
    title: 'Quality Ingredients',
    desc: 'Bahan pilihan yang halal dan segar, tanpa kompromi.',
    icon: 'ingredients',
  },
  {
    title: 'Shared with Love',
    desc: 'Dibuat untuk dibagi — karena makanan adalah cara merawat hubungan.',
    icon: 'love',
  },
];
