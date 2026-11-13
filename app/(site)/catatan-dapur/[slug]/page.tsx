import Link from 'next/link';
import { Section } from '@/components/Section';
import { ImageWithScrim } from '@/components/ImageWithScrim';
import { RichText } from '@/components/RichText';
import { Button } from '@/components/Button';
import { JournalGrid, formatJournalDate } from '@/components/blocks/JournalCards';
import { BreadcrumbJsonLd, JsonLdScript, absoluteUrl } from '@/components/JsonLd';
import { buildMetadata, canonicalFor } from '@/lib/seo';
import { getJournalPost, getSettings } from '@/lib/cms';
import { redirectOrNotFound } from '@/lib/redirect';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const [post, { site }] = await Promise.all([getJournalPost(params.slug), getSettings()]);
  if (!post) return { title: { absolute: `Catatan Dapur · ${site.siteName}` }, robots: { index: false } };
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
  const [post, { site }] = await Promise.all([getJournalPost(params.slug), getSettings()]);
  if (!post) return redirectOrNotFound(`/catatan-dapur/${params.slug}`);
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
          dateModified: post.updatedAt ?? post.publishedAt,
          author: { '@type': post.author ? 'Person' : 'Organization', name: post.author || site.siteName },
          publisher: { '@type': 'Organization', name: site.siteName },
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
          <RichText html={post.bodyHtml} />
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
      {post.related.length > 0 && (
        <Section dividerAbove eyebrow="Baca juga" title="Catatan lainnya">
          <JournalGrid posts={post.related} headingAs="h3" />
        </Section>
      )}
    </article>
  );
}
