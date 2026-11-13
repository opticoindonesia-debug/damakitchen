import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { OrganizationJsonLd } from '@/components/JsonLd';
import { SiteConfigProvider } from '@/components/SiteConfig';
import { getSettings, getSubBrands, isPreview } from '@/lib/cms';
import { themeCss } from '@/lib/themeCss';

/**
 * Rendered per request from the database (published content, cached and
 * invalidated on every publish), so admin changes are live immediately.
 */
export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [subBrands, { site, theme, nav }, preview] = await Promise.all([getSubBrands(), getSettings(), isPreview()]);

  return (
    <SiteConfigProvider value={{ whatsappNumber: site.whatsappNumber, whatsappMessage: site.whatsappMessage, channels: site.channels }}>
      {/* Built only from allow-listed tokens + validated hex colors; safe to inline. */}
      <style id="dama-theme" dangerouslySetInnerHTML={{ __html: themeCss(theme) }} />
      <OrganizationJsonLd site={site} />
      {preview && (
        <div className="sticky top-0 z-[70] flex items-center justify-center gap-3 bg-gold px-4 py-2 text-caption font-medium text-ink" role="status">
          Mode pratinjau — Anda melihat draf yang belum diterbitkan.
          <Link href="/api/admin/preview/disable" prefetch={false} className="underline underline-offset-4">
            Keluar pratinjau
          </Link>
        </div>
      )}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-teal focus:px-4 focus:py-2 focus:text-cream"
      >
        Lewati ke konten utama
      </a>
      <Navbar
        subBrands={subBrands}
        logo={theme.headerStyle === 'dark' ? (site.logoLight?.url ?? site.logo?.url) : site.logo?.url}
        monogram={site.monogram?.url}
        items={nav.items}
        cta={nav.cta.show ? { label: nav.cta.label, href: nav.cta.href } : null}
        tone={theme.headerStyle}
        sticky={theme.headerSticky}
      />
      <main id="main">{children}</main>
      <Footer subBrands={subBrands} site={site} footer={nav.footer} tone={theme.footerStyle} />
    </SiteConfigProvider>
  );
}
