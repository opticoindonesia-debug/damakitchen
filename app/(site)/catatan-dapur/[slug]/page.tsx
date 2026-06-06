import { notFound } from 'next/navigation';
import { Section } from '@/components/Section';
import { ImageWithScrim } from '@/components/ImageWithScrim';
import { PortableTextBody } from '@/components/PortableTextBody';
import { Button } from '@/components/Button';
import { buildMetadata } from '@/lib/seo';
import { getJournalPost, getJournalPosts } from '@/lib/cms';

export async function generateStaticParams() {
  const posts = await getJournalPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getJournalPost(params.slug);
  if (!post) return buildMetadata({ title: 'Catatan Dapur', description: '', path: '/catatan-dapur' });
  return buildMetadata({
    title: post.title,
    description: post.excerpt ?? 'Catatan dari dapur DAMA.',
    path: `/catatan-dapur/${post.slug}`,
  });
}

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function JournalPostPage({ params }: { params: { slug: string } }) {
  const post = await getJournalPost(params.slug);
  if (!post) notFound();

  return (
    <article>
      <Section eyebrow={formatDate(post.publishedAt) || 'Catatan Dapur'} title={post.title} titleAs="h1">
        <div className="max-w-prose">
          {post.coverImage && (
            <ImageWithScrim
              category="lifestyle"
              ratio="wide"
              src={post.coverImage}
              alt={`Gambar untuk ${post.title}`}
              className="mb-10"
            />
          )}
          <PortableTextBody value={post.body} />
          <div className="mt-12">
            <Button href="/catatan-dapur" variant="secondary">
              ← Semua catatan
            </Button>
          </div>
        </div>
      </Section>
    </article>
  );
}
