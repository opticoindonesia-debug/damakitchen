import Link from 'next/link';
import { Section } from '@/components/Section';
import { ImageWithScrim } from '@/components/ImageWithScrim';
import { InfoIconRow } from '@/components/InfoIconRow';
import { ProductOrderButtons } from '@/components/ProductOrderButtons';
import { ProductCard } from '@/components/ProductCard';
import { BreadcrumbJsonLd, JsonLdScript, ORG_ID, absoluteUrl, brandId } from '@/components/JsonLd';
import { buildMetadata, canonicalFor } from '@/lib/seo';
import { getArticlesForProduct, getProduct, getProductsBySubBrand, getSettings, getSubBrands } from '@/lib/cms';
import { JournalGrid } from '@/components/blocks/JournalCards';
import { TrackOnView } from '@/components/AnalyticsTracker';
import { redirectOrNotFound } from '@/lib/redirect';
import { formatRupiah } from '@/lib/utils';

type Props = { params: { slug: string } };

const AVAILABILITY: Record<string, { label: string; schema: string }> = {
  available: { label: 'Tersedia', schema: 'https://schema.org/InStock' },
  preorder: { label: 'Pre-order', schema: 'https://schema.org/PreOrder' },
  seasonal: { label: 'Musiman', schema: 'https://schema.org/LimitedAvailability' },
  unavailable: { label: 'Sedang tidak tersedia', schema: 'https://schema.org/OutOfStock' },
};

export async function generateMetadata({ params }: Props) {
  const [p, { site }] = await Promise.all([getProduct(params.slug), getSettings()]);
  if (!p) return { title: { absolute: `Menu | ${site.siteName}` }, robots: { index: false } };
  return buildMetadata({ title: p.name, description: p.blurb, path: `/menu/${p.slug}`, seo: p.seo, siteName: site.siteName, image: p.image });
}

export default async function ProductPage({ params }: Props) {
  const [p, subBrands] = await Promise.all([getProduct(params.slug), getSubBrands()]);
  if (!p) return redirectOrNotFound(`/menu/${params.slug}`);
  const sb = subBrands.find((s) => s.slug === p.subBrand);
  const [siblingsAll, articles] = await Promise.all([sb ? getProductsBySubBrand(sb.slug) : Promise.resolve([]), getArticlesForProduct(p.slug)]);
  const siblings = siblingsAll.filter((x) => x.slug !== p.slug).slice(0, 3);
  const details = [
    { title: 'Porsi / berat', body: p.serving },
    { title: 'Bahan', body: p.ingredients },
    { title: 'Cara penyimpanan', body: p.storage },
    { title: 'Cara penyajian', body: p.preparation },
  ].filter((d) => d.body);
  const path = `/menu/${p.slug}`;
  const avail = AVAILABILITY[p.availability] ?? AVAILABILITY.available;
  const images = [...(p.image ? [{ url: p.image, alt: p.imageAlt }] : []), ...p.gallery];

  return (
    <>
      <JsonLdScript
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.name,
          description: p.seo.description || p.description || p.blurb,
          ...(images.length ? { image: images.map((i) => absoluteUrl(i.url)) } : {}),
          brand: sb ? { '@id': brandId(sb.slug) } : { '@id': ORG_ID },
          manufacturer: { '@id': ORG_ID },
          ...(p.category ? { category: p.category.name } : {}),
          url: canonicalFor(path, p.seo.canonical),
          ...(p.price != null
            ? { offers: { '@type': 'Offer', price: p.price, priceCurrency: 'IDR', availability: avail.schema, url: canonicalFor(path) } }
            : {}),
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', path: '/' },
          { name: 'Menu', path: '/menu' },
          { name: p.name, path },
        ]}
      />
      <TrackOnView event="view_item" params={{ item_id: p.slug, item_name: p.name, item_brand: sb?.name, item_category: p.category?.name, price: p.price ?? undefined, currency: p.price != null ? 'IDR' : undefined }} />
      <Section>
        <nav aria-label="Breadcrumb" className="mb-8 text-caption text-ink-soft">
          <Link href="/" className="hover:underline">Beranda</Link> / <Link href="/menu" className="hover:underline">Menu</Link>
          {sb && (
            <>
              {' / '}
              <Link href={`/${sb.slug}`} className="hover:underline">{sb.name}</Link>
            </>
          )}
        </nav>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <ImageWithScrim category={p.imageCategory} ratio="square" warmBorder priority src={p.image} alt={p.imageAlt || `${p.name} — ${p.blurb}`} sizes="(max-width: 1024px) 100vw, 600px" />
            {p.gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {p.gallery.map((g, i) => (
                  <ImageWithScrim key={`${g.url}-${i}`} category={p.imageCategory} ratio="square" src={g.url} alt={g.alt || p.name} sizes="200px" />
                ))}
              </div>
            )}
          </div>
          <div>
            {sb && (
              <Link href={`/${sb.slug}`} className="inline-flex items-center gap-2 text-label uppercase tracking-[0.16em] text-ink-soft hover:text-teal">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sb.markerHex }} aria-hidden="true" />
                {sb.name}
              </Link>
            )}
            <h1 className="mt-3 text-display-lg text-teal">{p.name}</h1>
            <p className="mt-4 text-body-lg text-ink-soft">{p.blurb}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {p.price != null && (
                <p className="font-sans text-heading font-semibold text-ink" data-testid="product-price">
                  {formatRupiah(p.price)}
                  {p.priceNote && <span className="ml-1 text-body font-normal text-ink-soft">{p.priceNote}</span>}
                </p>
              )}
              <span className="rounded-full bg-gold-20 px-3 py-1 text-caption text-ink">{avail.label}</span>
            </div>
            {p.description && (
              <div className="mt-6 space-y-4 text-body text-ink">
                {p.description.split(/\n\s*\n/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}
            <div className="mt-6">
              <InfoIconRow info={p.info} />
            </div>
            {details.length > 0 && (
              <dl className="mt-8 space-y-5 border-t border-teal/10 pt-6">
                {details.map((d) => (
                  <div key={d.title}>
                    <dt className="font-display text-body-lg text-teal">{d.title}</dt>
                    <dd className="mt-1 whitespace-pre-line text-body text-ink-soft">{d.body}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="mt-8">
              <ProductOrderButtons productName={sb ? `${p.name} (${sb.name})` : p.name} channels={sb?.channels ?? ['whatsapp']} links={p.orderLinks} />
            </div>
          </div>
        </div>
      </Section>
      {sb && sb.faqs.length > 0 && (
        <Section dividerAbove eyebrow="Tanya jawab" title={`Tentang ${sb.name}`}>
          <div className="max-w-prose space-y-6">
            {sb.faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-display text-heading text-teal">{f.q}</h3>
                <p className="mt-1 text-body text-ink-soft">{f.a}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
      {articles.length > 0 && (
        <Section dividerAbove eyebrow="Catatan Dapur" title="Bacaan terkait">
          <JournalGrid posts={articles.slice(0, 3)} headingAs="h3" />
        </Section>
      )}
      {siblings.length > 0 && sb && (
        <Section dividerAbove eyebrow={sb.name} title="Hidangan lain dari lini ini">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.map((s) => (
              <ProductCard key={s.slug} product={s} subBrand={sb} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
