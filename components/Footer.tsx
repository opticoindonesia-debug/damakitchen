import Link from 'next/link';
import { Logo } from './Logo';
import { PatternBand } from './PatternBand';
import type { SubBrand } from '@/content/subbrands';
import { DEFAULT_NAVIGATION, DEFAULT_SITE, type NavigationData, type SiteSettingsData } from '@/lib/settings';
import { cn, socialHandle } from '@/lib/utils';

/**
 * Footer (§6): logo + tagline, sub-brand links, explore links, contact,
 * "by DAMA" note, socials, copyright. Everything comes from Admin →
 * Navigasi & Footer and Pengaturan Situs; style from Admin → Tampilan.
 */
export function Footer({
  subBrands = [],
  site = DEFAULT_SITE,
  footer = DEFAULT_NAVIGATION.footer,
  tone = 'dark',
}: {
  subBrands?: SubBrand[];
  site?: SiteSettingsData;
  footer?: NavigationData['footer'];
  tone?: 'dark' | 'light';
}) {
  const year = new Date().getFullYear();
  const dark = tone === 'dark';
  const c = {
    heading: dark ? 'text-gold' : 'text-terracotta-deep',
    text: dark ? 'text-cream/85 hover:text-cream' : 'text-ink-soft hover:text-teal',
    muted: dark ? 'text-cream/75' : 'text-ink-soft',
  };
  const socials = [
    { label: 'Instagram', href: site.instagram },
    { label: 'TikTok', href: site.tiktok },
    { label: 'Threads', href: site.threads },
    { label: 'Facebook', href: site.facebook },
    { label: 'YouTube', href: site.youtube },
  ].filter((s) => s.href);
  const logo = dark ? site.logoLight?.url : site.logo?.url;

  return (
    <footer className={cn('relative mt-section overflow-hidden', dark ? 'bg-teal text-cream' : 'border-t border-teal/10 bg-cream-deep text-ink')}>
      <PatternBand motif="songket-geometric" opacity={0.05} />
      <div className="container-dama relative grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo variant="stacked" color={dark ? 'cream' : 'teal'} withTagline imageUrl={logo} />
          <p className={cn('mt-5 max-w-xs text-caption', c.muted)}>{site.description}</p>
        </div>

        {footer.showSubBrands && subBrands.length > 0 ? (
          <nav aria-label={footer.colSubBrand}>
            <h2 className={cn('mb-4 text-label font-semibold uppercase tracking-[0.18em]', c.heading)}>{footer.colSubBrand}</h2>
            <ul className="space-y-2.5">
              {subBrands.map((sb) => (
                <li key={sb.slug}>
                  <Link href={`/${sb.slug}`} className={cn('inline-flex items-center gap-2 text-caption', c.text)}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sb.markerHex }} />
                    {sb.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <div className="hidden lg:block" />
        )}

        <nav aria-label={footer.colExplore}>
          <h2 className={cn('mb-4 text-label font-semibold uppercase tracking-[0.18em]', c.heading)}>{footer.colExplore}</h2>
          <ul className="space-y-2.5 text-caption">
            {footer.exploreLinks.map((l, i) => {
              const href = l.href === 'whatsapp' ? '/go/whatsapp' : l.href;
              const external = /^https?:\/\//.test(href) || href.startsWith('/go/');
              return (
                <li key={`${l.href}-${i}`}>
                  {external || /^(mailto|tel):/.test(href) ? (
                    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={c.text}>
                      {l.label}
                    </a>
                  ) : (
                    <Link href={href} className={c.text}>
                      {l.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div>
          <h2 className={cn('mb-4 text-label font-semibold uppercase tracking-[0.18em]', c.heading)}>{footer.colContact}</h2>
          <ul className="space-y-2.5 text-caption">
            {site.whatsappNumber && (
              <li>
                <a href="/go/whatsapp" target="_blank" rel="noopener noreferrer" className={c.text}>
                  WhatsApp +{site.whatsappNumber}
                </a>
              </li>
            )}
            {site.email && (
              <li>
                <a href={`mailto:${site.email}`} className={c.text}>
                  {site.email}
                </a>
              </li>
            )}
            {site.phone && (
              <li>
                <a href={`tel:${site.phone.replace(/[^+0-9]/g, '')}`} className={c.text}>
                  {site.phone}
                </a>
              </li>
            )}
            {footer.showSocials &&
              socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={c.text}>
                    {s.label} {socialHandle(s.href)}
                  </a>
                </li>
              ))}
            {site.address && <li className={c.muted}>{site.address}</li>}
            {site.operatingHours && <li className={c.muted}>{site.operatingHours}</li>}
          </ul>
        </div>
      </div>

      <div className={cn('border-t', dark ? 'border-cream/15' : 'border-teal/10')}>
        <div className={cn('container-dama flex flex-col gap-2 py-6 text-caption sm:flex-row sm:items-center sm:justify-between', dark ? 'text-cream/65' : 'text-ink-soft')}>
          <p>{footer.note}</p>
          <p>
            © {year} {site.siteName}. {site.tagline}.
          </p>
        </div>
      </div>
    </footer>
  );
}
