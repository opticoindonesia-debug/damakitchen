import Link from 'next/link';
import { Section } from '@/components/Section';
import { ImageWithScrim } from '@/components/ImageWithScrim';
import { RichText } from '@/components/RichText';
import { Button } from '@/components/Button';
import { JournalGrid, formatJournalDate } from '@/components/blocks/JournalCards';
import { BreadcrumbJsonLd, JsonLdScript, ORG_ID, WEBSITE_ID, absoluteUrl } from '@/components/JsonLd';
import { buildMetadata, canonicalFor } from '@/lib/seo';
import { getJournalPost, getProducts, getSettings, getSubBrands } from '@/lib/cms';
import { ProductCard } from '@/components/ProductCard';
import { redirectOrNotFound } from '@/lib/redirect';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const [post, { site }] = await Promise.all([getJournalPost(params.slug), getSettings()]);
  if (!post) return { title: { absolute: `Catatan Dapur | ${site.siteName}` }, robots: { index: false } };
  return buildMetadata({
    title: post.title,
    description: post.excerpt ?? 'Catatan dari dapur DAMA.',
    path: `/catatan-dapur/${post.slug}`,
    seo: post.seo,
    siteName: site.siteName,
    image: post.coverImage,
    type: 'article',
  });
}

export default async function JournalPostPage({ params }: Props) {
  const [post, { site }, allProducts, subBrands] = await Promise.all([getJournalPost(params.slug), getSettings(), getProducts(), getSubBrands()]);
  if (!post) return redirectOrNotFound(`/catatan-dapur/${params.slug}`);
  const products = allProducts.filter((p) => post.relatedProducts.includes(p.slug));
  const path = `/catatan-dapur/${post.slug}`;

  return (
    <article>
      <JsonLdScript
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.seo.description || post.excerpt,
          ...(post.coverImage ? { image: absoluteUrl(post.coverImage) } : {}),
          datePublished: post.publishedAt,
          dateModified: post.modifiedAt ?? post.publishedAt,
          ...(products.length ? { about: products.map((p) => ({ '@type': 'Product', name: p.name, url: `${absoluteUrl('/menu/' + p.slug)}` })) } : {}),
          ...(post.sources.length ? { citation: post.sources.map((x) => x.url) } : {}),
          author: post.author ? { '@type': 'Person', name: post.author } : { '@id': ORG_ID },
          publisher: { '@id': ORG_ID },
          isPartOf: { '@id': WEBSITE_ID },
          inLanguage: 'id-ID',
          mainEntityOfPage: canonicalFor(path, post.seo.canonical),
          ...(post.tags.length ? { keywords: post.tags.map((t) => t.name).join(', ') } : {}),
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', path: '/' },
          { name: 'Catatan Dapur', path: '/catatan-dapur' },
          { name: post.title, path },
        ]}
      />
      <Section
        eyebrow={[post.category?.name, formatJournalDate(post.publishedAt)].filter(Boolean).join(' · ') || 'Catatan Dapur'}
        title={post.title}
        titleAs="h1"
      >
        <div className="max-w-prose">
          <nav aria-label="Breadcrumb" className="-mt-6 mb-8 text-caption text-ink-soft">
            <Link href="/" className="hover:underline">Beranda</Link> /{' '}
            <Link href="/catatan-dapur" className="hover:underline">Catatan Dapur</Link>
            {post.category && (
              <>
                {' / '}
                <Link href={`/catatan-dapur?kategori=${post.category.slug}`} className="hover:underline">
                  {post.category.name}
                </Link>
              </>
            )}
          </nav>
          {post.author && <p className="-mt-4 mb-8 text-caption text-ink-soft">Oleh {post.author}</p>}
          {post.coverImage && (
            <ImageWithScrim
              category="lifestyle"
              ratio="wide"
              priority
              src={post.coverImage}
              alt={post.coverAlt || `Gambar untuk ${post.title}`}
              className="mb-10"
            />
          )}
          {post.shortAnswer && (
            <aside aria-label="Jawaban singkat" className="mb-10 rounded-lg border-l-4 border-terracotta bg-cream-paper p-6">
              <p className="text-label font-semibold uppercase tracking-[0.16em] text-terracotta-deep">Jawaban singkat</p>
              <p className="mt-2 text-body-lg text-ink">{post.shortAnswer}</p>
            </aside>
          )}
          <RichText html={post.bodyHtml} />
          {post.sources.length > 0 && (
            <section className="mt-10 border-t border-teal/10 pt-6" aria-labelledby="sumber">
              <h2 id="sumber" className="font-display text-heading text-teal">Sumber</h2>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-caption text-ink-soft">
                {post.sources.map((x) => (
                  <li key={x.url}>
                    <a href={x.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{x.title}</a>
                  </li>
                ))}
              </ol>
            </section>
          )}
          {post.modifiedAt && post.publishedAt && post.modifiedAt.slice(0, 10) !== post.publishedAt.slice(0, 10) && (
            <p className="mt-6 text-caption text-ink-soft">Diperbarui {formatJournalDate(post.modifiedAt)}</p>
          )}
          {post.tags.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tag">
              {post.tags.map((t) => (
                <li key={t.slug} className="rounded-full bg-teal/5 px-3 py-1 text-caption text-teal">
                  #{t.name}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-12">
            <Button href="/catatan-dapur" variant="secondary">
              ← Semua catatan
            </Button>
          </div>
        </div>
      </Section>
      {products.length > 0 && (
        <Section dividerAbove eyebrow="Dari dapur DAMA" title="Hidangan yang dibahas">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} subBrand={subBrands.find((s) => s.slug === p.subBrand)} />
            ))}
          </div>
        </Section>
      )}
      {post.related.length > 0 && (
        <Section dividerAbove eyebrow="Baca juga" title="Catatan lainnya">
          <JournalGrid posts={post.related} headingAs="h3" />
        </Section>
      )}
    </article>
  );
}
