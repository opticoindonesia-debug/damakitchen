import Link from 'next/link';
import { Section } from '@/components/Section';
import { DiamondDivider } from '@/components/DiamondDivider';
import { Button } from '@/components/Button';
import { ImageWithScrim } from '@/components/ImageWithScrim';
import { Reveal } from '@/components/Reveal';
import { buildMetadata } from '@/lib/seo';
import { getJournalPosts } from '@/lib/cms';

export const metadata = buildMetadata({
  title: 'Catatan Dapur',
  description: 'Cerita kecil dari dapur DAMA — resep, bahan, dan orang di baliknya.',
  path: '/catatan-dapur',
});

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function CatatanDapurPage() {
  const posts = await getJournalPosts();

  return (
    <Section eyebrow="Catatan Dapur" title="Cerita kecil dari dapur kami" titleAs="h1">
      {posts.length === 0 ? (
        <div className="max-w-prose">
          <p className="text-body-lg text-ink-soft">
            Di sini nantinya kami berbagi cerita di balik masakan — resep yang dijaga, bahan yang
            dipilih, dan orang-orang yang membuat DAMA terasa seperti rumah.
          </p>
          <DiamondDivider />
          <div className="rounded-lg border border-teal/10 bg-cream-paper p-8 text-center">
            <p className="font-display text-heading text-teal">Segera hadir</p>
            <p className="mt-2 text-caption text-ink-soft">
              Sambil menunggu, mari berkenalan lewat cerita kami.
            </p>
            <div className="mt-5 flex justify-center">
              <Button href="/cerita" variant="secondary">
                Baca cerita DAMA
              </Button>
            </div>
          </div>
        </div>
      ) : (
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
                      {formatDate(post.publishedAt)}
                    </span>
                  )}
                  <h2 className="mt-2 font-display text-heading text-teal">{post.title}</h2>
                  {post.excerpt && (
                    <p className="mt-2 flex-1 text-caption text-ink-soft">{post.excerpt}</p>
                  )}
                  <span className="mt-4 text-caption font-medium text-terracotta-deep">
                    Baca selengkapnya →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}
