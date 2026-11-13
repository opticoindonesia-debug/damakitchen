import Link from 'next/link';
import { Section } from '@/components/Section';
import { DiamondDivider } from '@/components/DiamondDivider';
import { Button } from '@/components/Button';
import { JournalGrid } from '@/components/blocks/JournalCards';
import { buildMetadata } from '@/lib/seo';
import { getJournalPosts, getSettings } from '@/lib/cms';
import { cn } from '@/lib/utils';

export async function generateMetadata() {
  const { site } = await getSettings();
  return buildMetadata({
    title: 'Catatan Dapur',
    description: 'Cerita kecil dari dapur DAMA — resep, bahan, dan orang di baliknya.',
    path: '/catatan-dapur',
    siteName: site.siteName,
  });
}

export default async function CatatanDapurPage({ searchParams }: { searchParams: { kategori?: string } }) {
  const all = await getJournalPosts();
  const categories = [...new Map(all.filter((p) => p.category).map((p) => [p.category!.slug, p.category!])).values()];
  const active = categories.find((c) => c.slug === searchParams.kategori)?.slug;
  const posts = active ? all.filter((p) => p.category?.slug === active) : all;

  return (
    <Section eyebrow="Catatan Dapur" title="Cerita kecil dari dapur kami" titleAs="h1">
      {all.length === 0 ? (
        <div className="max-w-prose">
          <p className="text-body-lg text-ink-soft">
            Di sini nantinya kami berbagi cerita di balik masakan — resep yang dijaga, bahan yang
            dipilih, dan orang-orang yang membuat DAMA terasa seperti rumah.
          </p>
          <DiamondDivider />
          <div className="rounded-lg border border-teal/10 bg-cream-paper p-8 text-center">
            <p className="font-display text-heading text-teal">Segera hadir</p>
            <p className="mt-2 text-caption text-ink-soft">Sambil menunggu, mari berkenalan lewat cerita kami.</p>
            <div className="mt-5 flex justify-center">
              <Button href="/cerita" variant="secondary">
                Baca cerita DAMA
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {categories.length > 1 && (
            <nav aria-label="Kategori artikel" className="mb-10 flex flex-wrap gap-3">
              {[{ slug: undefined, name: 'Semua' }, ...categories].map((c) => (
                <Link
                  key={c.slug ?? 'all'}
                  href={c.slug ? `/catatan-dapur?kategori=${c.slug}` : '/catatan-dapur'}
                  className={cn(
                    'min-h-[44px] rounded-full border px-5 py-2 text-caption font-medium',
                    active === c.slug ? 'border-teal bg-teal text-cream' : 'border-teal/25 text-ink hover:bg-teal/5',
                  )}
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          )}
          <JournalGrid posts={posts} />
        </>
      )}
    </Section>
  );
}
