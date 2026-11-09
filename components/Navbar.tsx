'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { subBrandList, type SubBrand } from '@/content/subbrands';
import { cn } from '@/lib/utils';
import { DEFAULT_NAV, DEFAULT_NAV_CTA, type NavItem } from '@/lib/siteText';

function NavLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/**
 * Sticky cream navbar (§6). Condenses to the monogram on scroll; offers a
 * grouped sub-brand menu and a mobile drawer. Items, order, labels and the CTA
 * come from Studio (Pengaturan Situs → Navigasi). Escape closes open menus.
 */
export function Navbar({
  subBrands = subBrandList,
  logo,
  monogram,
  items = DEFAULT_NAV,
  cta = DEFAULT_NAV_CTA,
}: {
  subBrands?: SubBrand[];
  logo?: string;
  monogram?: string;
  items?: NavItem[];
  cta?: { label: string; href: string } | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change.
  useEffect(() => {
    setDrawerOpen(false);
    setSubOpen(false);
  }, [pathname]);

  // Escape closes the drawer/dropdown and returns focus to the menu button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setSubOpen(false);
      setDrawerOpen((open) => {
        if (open) triggerRef.current?.focus();
        return false;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock scroll when the drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const showSubBrands = (label: string, key: string) => (
    <div
      key={key}
      className="relative"
      onMouseEnter={() => setSubOpen(true)}
      onMouseLeave={() => setSubOpen(false)}
    >
      <button
        type="button"
        aria-expanded={subOpen}
        aria-haspopup="true"
        onClick={() => setSubOpen((v) => !v)}
        className="text-body text-ink hover:text-teal"
      >
        {label}
      </button>
      {subOpen && (
        <div className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-3">
          <ul className="rounded-lg border border-teal/10 bg-cream-paper p-2 shadow-soft">
            {subBrands.map((sb) => (
              <li key={sb.slug}>
                <Link href={`/${sb.slug}`} className="flex items-center gap-3 rounded px-3 py-2 hover:bg-teal/5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: sb.markerHex }} />
                  <span className="text-caption text-ink">{sb.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-all duration-300 ease-calm',
        scrolled ? 'border-teal/10 bg-cream/90 backdrop-blur-sm' : 'border-transparent bg-cream',
      )}
    >
      <nav aria-label="Navigasi utama" className="container-dama flex items-center justify-between gap-6 py-4">
        <Link href="/" aria-label="DAMA KITCHEN — beranda" className="rounded">
          {scrolled ? (
            <Logo variant="monogram" color="teal" monogramUrl={monogram} imageUrl={logo} />
          ) : (
            <Logo variant="primary" color="teal" imageUrl={logo} />
          )}
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 lg:flex">
          {items.map((item, i) =>
            item.kind === 'subBrands' ? (
              showSubBrands(item.label, `sb-${i}`)
            ) : (
              <NavLink key={`${item.href}-${i}`} href={item.href} className="text-body text-ink hover:text-teal">
                {item.label}
              </NavLink>
            ),
          )}
          {cta && (
            <NavLink
              href={cta.href}
              className="min-h-[44px] rounded bg-terracotta px-5 py-2.5 text-body font-medium text-cream transition-colors duration-300 hover:bg-terracotta-80"
            >
              {cta.label}
            </NavLink>
          )}
        </div>

        {/* Mobile trigger */}
        <button
          ref={triggerRef}
          type="button"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-teal lg:hidden"
          aria-expanded={drawerOpen}
          aria-controls="mobile-drawer"
          aria-label={drawerOpen ? 'Tutup menu' : 'Buka menu navigasi'}
          onClick={() => setDrawerOpen((v) => !v)}
        >
          {drawerOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div id="mobile-drawer" className="border-t border-teal/10 bg-cream lg:hidden">
          <ul className="container-dama flex flex-col gap-1 py-4">
            {items.map((item, i) =>
              item.kind === 'subBrands' ? (
                <li key={`sb-${i}`}>
                  <p className="px-2 pt-3 text-label font-semibold uppercase tracking-[0.18em] text-terracotta-deep">
                    {item.label}
                  </p>
                  <ul>
                    {subBrands.map((sb) => (
                      <li key={sb.slug}>
                        <Link
                          href={`/${sb.slug}`}
                          className="flex items-center gap-3 rounded px-2 py-3 text-body text-ink hover:bg-teal/5"
                        >
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: sb.markerHex }}
                          />
                          {sb.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={`${item.href}-${i}`}>
                  <NavLink href={item.href} className="block rounded px-2 py-3 text-body-lg text-ink hover:bg-teal/5">
                    {item.label}
                  </NavLink>
                </li>
              ),
            )}
            {cta && (
              <li className="px-2 pt-2">
                <NavLink
                  href={cta.href}
                  className="block min-h-[44px] rounded bg-terracotta px-5 py-3 text-center text-body font-medium text-cream"
                >
                  {cta.label}
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
