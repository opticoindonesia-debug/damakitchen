import { infoIconMap } from './icons';
import type { ProductInfo } from '@/content/products';

/**
 * Small labelled info-icon row for product cards (§4.4, §7.4).
 * Icons carry a visible/accessible label — never color-only signaling.
 */

const infoLabel: Record<ProductInfo, string> = {
  halal: 'Halal',
  pedas: 'Pedas',
  'sambal-terpisah': 'Sambal terpisah',
  porsi: 'Porsi individu',
};

const infoIconKey: Record<ProductInfo, keyof typeof infoIconMap> = {
  halal: 'halal',
  pedas: 'pedas',
  'sambal-terpisah': 'sambal-terpisah',
  porsi: 'porsi',
};

export function InfoIconRow({ info }: { info: ProductInfo[] }) {
  if (info.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2">
      {info.map((key) => {
        const Icon = infoIconMap[infoIconKey[key]];
        return (
          <li key={key} className="inline-flex items-center gap-1.5 text-caption text-ink-soft">
            <Icon width={18} height={18} className="text-teal-80" />
            {infoLabel[key]}
          </li>
        );
      })}
    </ul>
  );
}
