import Link from 'next/link';
import { ImageWithScrim } from '@/components/ImageWithScrim';
import { Reveal } from '@/components/Reveal';
import { getJournalPosts, type JournalCard } from '@/lib/cms';

export function formatJournalDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Article cards grid; `headingAs` keeps heading order correct per context. */
export function JournalGrid({ posts, headingAs = 'h2' }: { posts: JournalCard[]; headingAs?: 'h2' | 'h3' }) {
  const H = headingAs;
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, i) => (
        <Reveal key={post.slug} delay={(i % 3) * 0.06}>
          <Link
            href={`/catatan-dapur/${post.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-lg border border-teal/10 bg-cream-paper shadow-soft transition-transform duration-300 ease-calm hover:-translate-y-1"
          >
            <ImageWithScrim
              category="lifestyle"
              ratio="landscape"
              rounded={false}
              src={post.coverImage}
              alt={`Sampul artikel: ${post.title}`}
            />
            <div className="flex flex-1 flex-col p-6">
              {post.publishedAt && (
                <span className="text-label uppercase tracking-[0.14em] text-ink-soft">
                  {formatJournalDate(post.publishedAt)}
                </span>
              )}
              <H className="mt-2 font-display text-heading text-teal">{post.title}</H>
              {post.excerpt && <p className="mt-2 flex-1 text-caption text-ink-soft">{post.excerpt}</p>}
              <span className="mt-4 text-caption font-medium text-terracotta-deep">Baca selengkapnya →</span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

/** Latest articles (page-builder block). Renders nothing until posts exist. */
export async function JournalCards({ limit = 3 }: { limit?: number }) {
  const posts = (await getJournalPosts()).slice(0, limit);
  if (!posts.length) return null;
  return <JournalGrid posts={posts} headingAs="h3" />;
}
