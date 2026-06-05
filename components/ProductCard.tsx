import { ImageWithScrim } from './ImageWithScrim';
import { InfoIconRow } from './InfoIconRow';
import { ChannelButton } from './ChannelButton';
import { waOrder } from '@/lib/whatsapp';
import { subBrands, type SubBrandSlug } from '@/content/subbrands';
import type { Product } from '@/content/products';

/**
 * ProductCard (§7.4): photo, name (Playfair), honest line, sub-brand tag,
 * info icons, and a channel CTA routing to the line's primary channel.
 */
export function ProductCard({ product }: { product: Product }) {
  const sb = subBrands[product.subBrand as SubBrandSlug];
  const primaryChannel = sb.channels[0];
  // For WhatsApp-first lines, prefill a warm order message with the product name.
  const href =
    primaryChannel === 'whatsapp' ? waOrder(`${product.name} (${sb.name})`) : undefined;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-teal/10 bg-cream-paper shadow-soft">
      <ImageWithScrim
        category={product.imageCategory}
        ratio="landscape"
        rounded={false}
        src={product.image}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
        alt={`${product.name} dari ${sb.name} — ${product.blurb}`}
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: sb.markerHex }}
            aria-hidden="true"
          />
          <span className="text-label uppercase tracking-[0.14em] text-ink-soft">
            {sb.shortName}
          </span>
        </div>

        <h3 className="mt-2 font-display text-heading text-teal">{product.name}</h3>
        <p className="mt-2 text-caption text-ink-soft">{product.blurb}</p>

        {/* TODO: render price here when confirmed. */}

        <div className="mt-4">
          <InfoIconRow info={product.info} />
        </div>

        <div className="mt-6 pt-2">
          <ChannelButton channel={primaryChannel} href={href} fullWidth />
        </div>
      </div>
    </article>
  );
}
