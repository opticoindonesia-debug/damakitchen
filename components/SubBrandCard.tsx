import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { SubBrand } from '@/content/subbrands';
import { site } from '@/content/site';

/**
 * SubBrandCard (§7.1): tinted with the line's marker color as an accent
 * (never a full fill), carrying the correct emotion + lead message.
 * This grid is the navigational heart of the site.
 */
export function SubBrandCard({ subBrand }: { subBrand: SubBrand }) {
  return (
    <Link
      href={`/${subBrand.slug}`}
      className="group flex h-full flex-col rounded-lg border border-teal/10 bg-cream-paper p-7 shadow-soft transition-transform duration-300 ease-calm hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      style={{ borderTopColor: subBrand.markerHex, borderTopWidth: 3 }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: subBrand.markerHex }}
          aria-hidden="true"
        />
        <span className="text-label font-semibold uppercase tracking-[0.16em] text-ink-soft">
          {subBrand.emotion}
        </span>
      </div>

      <h3 className="mt-4 font-display text-heading text-teal">{subBrand.name}</h3>
      <p className="text-caption italic text-ink-soft">{site.tagline} · by DAMA</p>

      <p className="mt-4 flex-1 text-body text-ink">{subBrand.lead}</p>

      <span
        className="mt-6 inline-flex items-center gap-1.5 text-caption font-medium"
        style={{ color: subBrand.markerHex }}
      >
        Lihat lini ini
        <ArrowRight
          size={16}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}
