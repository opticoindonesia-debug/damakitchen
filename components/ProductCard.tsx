'use client';

import Link from 'next/link';
import { ImageWithScrim } from './ImageWithScrim';
import { InfoIconRow } from './InfoIconRow';
import { ChannelButton } from './ChannelButton';
import { channelEnabled, useSiteConfig } from './SiteConfig';
import { waOrder } from '@/lib/whatsapp';
import { formatRupiah } from '@/lib/utils';
import { subBrands as staticSubBrands, type SubBrand, type SubBrandSlug } from '@/content/subbrands';
import type { Product } from '@/content/products';

type CardProduct = Product & {
  slug?: string;
  priceNote?: string;
  availability?: string;
  imageAlt?: string;
};

const AVAILABILITY: Record<string, string> = {
  preorder: 'Pre-order',
  seasonal: 'Musiman',
  unavailable: 'Sedang tidak tersedia',
};

/**
 * ProductCard (§7.4): photo, name (Playfair), honest line, sub-brand tag,
 * price (when set), info icons, and a channel CTA routing to the line's
 * first available channel.
 */
export function ProductCard({ product, subBrand }: { product: CardProduct; subBrand?: SubBrand }) {
  const cfg = useSiteConfig();
  const sb = subBrand ?? staticSubBrands[product.subBrand as SubBrandSlug];
  // Use the first ENABLED channel; fall back to WhatsApp if none are active.
  const primaryChannel = (sb?.channels ?? []).find((c) => channelEnabled(cfg, c)) ?? 'whatsapp';
  const label = sb ? `${product.name} (${sb.name})` : product.name;
  const href = primaryChannel === 'whatsapp' ? waOrder(label, cfg.whatsappNumber) : undefined;
  const status = product.availability ? AVAILABILITY[product.availability] : undefined;
  const detailHref = product.slug ? `/menu/${product.slug}` : undefined;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-teal/10 bg-cream-paper shadow-soft">
      <ImageWithScrim
        category={product.imageCategory}
        ratio="landscape"
        rounded={false}
        src={product.image}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
        alt={product.imageAlt || `${product.name}${sb ? ` dari ${sb.name}` : ''} — ${product.blurb}`}
      />
      <div className="flex flex-1 flex-col p-6">
        {sb && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sb.markerHex }} aria-hidden="true" />
            <span className="text-label uppercase tracking-[0.14em] text-ink-soft">{sb.shortName}</span>
            {status && <span className="ml-auto rounded-full bg-gold-20 px-2.5 py-0.5 text-label text-ink">{status}</span>}
          </div>
        )}

        <h3 className="mt-2 font-display text-heading text-teal">
          {detailHref ? (
            <Link href={detailHref} className="hover:underline hover:underline-offset-4">
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </h3>
        <p className="mt-2 text-caption text-ink-soft">{product.blurb}</p>

        {product.price != null && (
          <p className="mt-3 font-sans text-body font-semibold text-ink" data-testid="product-price">
            {formatRupiah(product.price)}
            {product.priceNote && <span className="ml-1 text-caption font-normal text-ink-soft">{product.priceNote}</span>}
          </p>
        )}

        <div className="mt-4">
          <InfoIconRow info={product.info} />
        </div>

        <div className="mt-auto pt-6">
          <ChannelButton channel={primaryChannel} href={href} fullWidth />
        </div>
      </div>
    </article>
  );
}
