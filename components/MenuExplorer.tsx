'use client';

import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { Reveal } from './Reveal';
import { cn } from '@/lib/utils';
import { products as staticProducts, type Product } from '@/content/products';
import { subBrandList as staticSubBrands, type SubBrand, type SubBrandSlug } from '@/content/subbrands';

/**
 * Menu explorer (§7.4): calm pill toggles in marker colors filter the catalog
 * by sub-brand. Active pill uses its marker color; the rest stay quiet.
 */
export function MenuExplorer({
  products = staticProducts,
  subBrands = staticSubBrands,
}: {
  products?: Product[];
  subBrands?: SubBrand[];
}) {
  const [active, setActive] = useState<SubBrandSlug | 'all'>('all');

  const filtered =
    active === 'all' ? products : products.filter((p) => p.subBrand === active);

  return (
    <div>
      <div className="flex flex-wrap gap-3" role="group" aria-label="Saring berdasarkan lini">
        <button
          type="button"
          onClick={() => setActive('all')}
          aria-pressed={active === 'all'}
          className={cn(
            'min-h-[44px] rounded-full border px-5 py-2 text-caption font-medium transition-colors duration-300',
            active === 'all'
              ? 'border-teal bg-teal text-cream'
              : 'border-teal/25 text-ink hover:bg-teal/5',
          )}
        >
          Semua
        </button>
        {subBrands.map((sb) => {
          const isActive = active === sb.slug;
          return (
            <button
              key={sb.slug}
              type="button"
              onClick={() => setActive(sb.slug)}
              aria-pressed={isActive}
              className={cn(
                'inline-flex min-h-[44px] items-center gap-2 rounded-full border px-5 py-2 text-caption font-medium transition-colors duration-300',
                !isActive && 'border-teal/25 text-ink hover:bg-teal/5',
              )}
              style={
                isActive
                  ? { backgroundColor: sb.markerHex, borderColor: sb.markerHex, color: '#F7F1E3' }
                  : undefined
              }
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: isActive ? '#F7F1E3' : sb.markerHex }}
                aria-hidden="true"
              />
              {sb.shortName}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 0.06}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
