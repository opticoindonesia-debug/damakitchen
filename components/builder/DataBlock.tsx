import Link from 'next/link';
import { SubBrandCard } from '@/components/SubBrandCard';
import { PillarRow } from '@/components/PillarRow';
import { TestimonialsGrid } from '@/components/Testimonials';
import { ChannelButton } from '@/components/ChannelButton';
import { MenuExplorer } from '@/components/MenuExplorer';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';
import { ChannelMatrix } from '@/components/blocks/ChannelMatrix';
import { ContactDetails } from '@/components/blocks/ContactDetails';
import { GiftTiers } from '@/components/blocks/GiftTiers';
import { JournalGrid } from '@/components/blocks/JournalCards';
import { ValuesList } from '@/components/blocks/ValuesList';
import type { SubBrandSlug } from '@/content/subbrands';
import {
  getJournalPosts,
  getPillars,
  getProducts,
  getProductsBySubBrand,
  getSubBrands,
  getTestimonials,
} from '@/lib/cms';
import { cn } from '@/lib/utils';
import { SectionHeader, SectionShell, bgOf, toneOf, type HeadingTag, type SectionStyle } from './shell';

/** Renders live data from other Studio collections (sub-brands, products, …). */
async function DataContent({ source, subBrand, linkClass }: { source: string; subBrand?: string; linkClass: string }) {
  switch (source) {
    case 'subBrands': {
      const list = await getSubBrands();
      return (
        <div className="grid gap-6 sm:grid-cols-2 lg:flex lg:flex-row lg:flex-nowrap lg:items-stretch">
          {list.map((sb, i) => (
            <Reveal key={sb.slug} delay={i * 0.06} className="lg:min-w-0 lg:flex-1">
              <SubBrandCard subBrand={sb} />
            </Reveal>
          ))}
        </div>
      );
    }
    case 'pillars':
      return <PillarRow pillars={await getPillars()} />;
    case 'values':
      return <ValuesList />;
    case 'testimonials':
      return <TestimonialsGrid items={await getTestimonials()} />;
    case 'channels':
      return (
        <>
          <div className="flex flex-wrap gap-4">
            {(['shopee', 'tiktok', 'whatsapp', 'gofood', 'grab'] as const).map((c) => (
              <ChannelButton key={c} channel={c} />
            ))}
          </div>
          <p className={cn('mt-6 text-caption', linkClass)}>
            Tidak yakin kanal mana untuk apa?{' '}
            <Link href="/pesan" className="underline underline-offset-4">
              Lihat panduan lengkapnya
            </Link>
            .
          </p>
        </>
      );
    case 'channelMatrix':
      return <ChannelMatrix />;
    case 'menu': {
      const [products, subBrands] = await Promise.all([getProducts(), getSubBrands()]);
      return <MenuExplorer products={products} subBrands={subBrands} />;
    }
    case 'products': {
      if (!subBrand) return null;
      const products = await getProductsBySubBrand(subBrand as SubBrandSlug);
      return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      );
    }
    case 'giftTiers':
      return <GiftTiers />;
    case 'journal': {
      const posts = (await getJournalPosts()).slice(0, 3);
      return posts.length ? <JournalGrid posts={posts} headingAs="h3" /> : null;
    }
    case 'contact':
      return <ContactDetails />;
    default:
      return null;
  }
}

export async function DataBlock({
  s,
  headingAs,
}: {
  s: SectionStyle & Record<string, unknown>;
  headingAs: HeadingTag;
}) {
  const bg = bgOf(s.background);
  const t = toneOf(bg);
  const content = await DataContent({
    source: s.source as string,
    subBrand: s.subBrand as string | undefined,
    linkClass: t.muted,
  });
  if (!content) return null;
  return (
    <SectionShell s={s}>
      <div className="container-dama">
        <SectionHeader
          eyebrow={s.eyebrow as string}
          heading={s.heading as string}
          intro={s.intro as string}
          as={headingAs}
          t={t}
        />
        {content}
      </div>
    </SectionShell>
  );
}
