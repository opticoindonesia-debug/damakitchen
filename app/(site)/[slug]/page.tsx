import { notFound } from 'next/navigation';
import { Section } from '@/components/Section';
import { ImageWithScrim } from '@/components/ImageWithScrim';
import { PortableTextBody } from '@/components/PortableTextBody';
import { buildMetadata } from '@/lib/seo';
import { getPage, getPageSlugs } from '@/lib/cms';

/**
 * Free pages created in the CMS (Halaman). Static routes always take
 * precedence over this dynamic segment, so built-in pages are never shadowed.
 */
export async function generateStaticParams() {
  const slugs = await getPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);
  if (!page) return buildMetadata({ title: 'Halaman', description: '', path: `/${params.slug}` });
  return buildMetadata({
    title: page.title,
    description: page.seoDescription ?? page.intro ?? page.title,
    path: `/${page.slug}`,
  });
}

export default async function CmsPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);
  if (!page) notFound();

  return (
    <Section eyebrow={page.eyebrow} title={page.title} titleAs="h1" intro={page.intro}>
      <div className="max-w-prose">
        {page.heroImage && (
          <ImageWithScrim
            category="lifestyle"
            ratio="wide"
            src={page.heroImage}
            alt={page.title}
            className="mb-10"
          />
        )}
        <PortableTextBody value={page.body} />
      </div>
    </Section>
  );
}
