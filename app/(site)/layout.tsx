import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { OrganizationJsonLd } from '@/components/JsonLd';
import { getSubBrands, getSiteSettings } from '@/lib/cms';
import { themeOverrideCss } from '@/lib/theme';

/** ISR: pages refresh ~every minute so CMS edits appear quickly without a redeploy. */
export const revalidate = 60;

/**
 * Site chrome (nav + footer + skip-link). Lives in the (site) route group so
 * the embedded Studio at /studio renders full-screen without it.
 * Sub-brands are fetched once here (CMS or static fallback) and shared.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [subBrands, settings] = await Promise.all([getSubBrands(), getSiteSettings()]);
  // Built only from validated hex → numeric "r g b" triples; safe to inline.
  const themeCss = themeOverrideCss(settings.theme);

  return (
    <>
      {themeCss && <style id="dama-theme" dangerouslySetInnerHTML={{ __html: themeCss }} />}
      <OrganizationJsonLd />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-teal focus:px-4 focus:py-2 focus:text-cream"
      >
        Lewati ke konten utama
      </a>
      <Navbar
        subBrands={subBrands}
        logo={settings.logo}
        monogram={settings.monogram}
        items={settings.nav}
        cta={settings.navCta}
      />
      <main id="main">{children}</main>
      <Footer
        subBrands={subBrands}
        logo={settings.logoLight}
        text={settings.footerText}
        settings={{
          umbrellaPromise: settings.umbrellaPromise,
          email: settings.email,
          instagram: settings.instagram,
          tiktok: settings.tiktok,
          threads: settings.threads,
        }}
      />
    </>
  );
}
