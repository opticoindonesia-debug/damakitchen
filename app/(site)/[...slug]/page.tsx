import { PageBuilder } from '@/components/builder/PageBuilder';
import { SubBrandPage } from '@/components/SubBrandPage';
import { buildMetadata } from '@/lib/seo';
import { getPage, getSettings, getSubBrand } from '@/lib/cms';
import { redirectOrNotFound } from '@/lib/redirect';

/**
 * Catch-all for everything not served by a dedicated route:
 *  1. custom pages built in Admin → Halaman (/<slug>),
 *  2. sub-brands added later in the admin (/<sub-brand-slug>),
 *  3. redirects (Admin → Pengalihan, and automatic ones after a slug change),
 *  4. otherwise a real 404.
 */
type Props = { params: { slug: string[] } };

export async function generateMetadata({ params }: Props) {
  const slug = params.slug.join('/');
  const { site } = await getSettings();
  if (params.slug.length === 1) {
    const page = await getPage(slug);
    if (page) {
      // Unique description: SEO field, else the page's own first intro/text.
      const first = page.sections.find((x) => !x.hidden && (x.intro || x.text || x.body));
      const derived = String(first?.intro ?? first?.text ?? first?.body ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
      return buildMetadata({ title: page.title, description: derived || site.description, path: `/${page.slug}`, seo: page.seo, siteName: site.siteName, image: site.ogImage?.url });
    }
    const sb = await getSubBrand(slug);
    if (sb) return buildMetadata({ title: sb.name, description: sb.lead, path: `/${sb.slug}`, seo: sb.seo, siteName: site.siteName, image: sb.heroImage });
  }
  return { title: { absolute: `Halaman tidak ditemukan | ${site.siteName}` }, robots: { index: false } };
}

export default async function CatchAll({ params }: Props) {
  const path = `/${params.slug.join('/')}`;
  if (params.slug.length === 1) {
    const page = await getPage(params.slug[0]);
    if (page) {
      const sections = page.sections.filter((s) => !s.hidden);
      return <PageBuilder sections={sections} />;
    }
    const sb = await getSubBrand(params.slug[0]);
    if (sb) return <SubBrandPage subBrand={sb} />;
  }
  return redirectOrNotFound(path);
}
