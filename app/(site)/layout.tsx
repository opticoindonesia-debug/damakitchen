import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { OrganizationJsonLd } from '@/components/JsonLd';
import { getSubBrands, getSiteSettings } from '@/lib/cms';

/** ISR: pages refresh ~hourly so CMS edits appear without a redeploy. */
export const revalidate = 3600;

/**
 * Site chrome (nav + footer + skip-link). Lives in the (site) route group so
 * the embedded Studio at /studio renders full-screen without it.
 * Sub-brands are fetched once here (CMS or static fallback) and shared.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [subBrands, settings] = await Promise.all([getSubBrands(), getSiteSettings()]);

  return (
    <>
      <OrganizationJsonLd />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-teal focus:px-4 focus:py-2 focus:text-cream"
      >
        Lewati ke konten utama
      </a>
      <Navbar subBrands={subBrands} logo={settings.logo} monogram={settings.monogram} />
      <main id="main">{children}</main>
      <Footer
        subBrands={subBrands}
        logo={settings.logoLight}
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
