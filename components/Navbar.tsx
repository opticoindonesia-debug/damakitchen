'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { subBrandList, type SubBrand } from '@/content/subbrands';
import { cn } from '@/lib/utils';

/**
 * Sticky cream navbar (§6). Condenses to the monogram on scroll; offers a
 * grouped sub-brand menu and a mobile drawer. Keyboard-operable throughout.
 */
export function Navbar({
  subBrands = subBrandList,
  logo,
  monogram,
}: {
  subBrands?: SubBrand[];
  logo?: string;
  monogram?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
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

  // Lock scroll when the drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-all duration-300 ease-calm',
        scrolled
          ? 'border-teal/10 bg-cream/90 backdrop-blur-sm'
          : 'border-transparent bg-cream',
      )}
    >
      <nav
        aria-label="Navigasi utama"
        className="container-dama flex items-center justify-between gap-6 py-4"
      >
        <Link href="/" aria-label="DAMA KITCHEN — beranda" className="rounded">
          {scrolled ? (
            <Logo variant="monogram" color="teal" monogramUrl={monogram} imageUrl={logo} />
          ) : (
            <Logo variant="primary" color="teal" imageUrl={logo} />
          )}
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 lg:flex">
          <Link href="/cerita" className="text-body text-ink hover:text-teal">
            Cerita
          </Link>
          <Link href="/menu" className="text-body text-ink hover:text-teal">
            Menu
          </Link>

          {/* Sub-brands grouped menu */}
          <div
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
              Sub-brand
            </button>
            {subOpen && (
              <div className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-3">
                <ul className="rounded-lg border border-teal/10 bg-cream-paper p-2 shadow-soft">
                  {subBrands.map((sb) => (
                    <li key={sb.slug}>
                      <Link
                        href={`/${sb.slug}`}
                        className="flex items-center gap-3 rounded px-3 py-2 hover:bg-teal/5"
                      >
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: sb.markerHex }}
                        />
                        <span className="text-caption text-ink">{sb.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Link href="/katering" className="text-body text-ink hover:text-teal">
            Katering
          </Link>
          <Link href="/hadiah" className="text-body text-ink hover:text-teal">
            Hadiah
          </Link>
          <Link
            href="/pesan"
            className="min-h-[44px] rounded bg-terracotta px-5 py-2.5 text-body font-medium text-cream transition-colors duration-300 hover:bg-terracotta-80"
          >
            Pesan
          </Link>
        </div>

        {/* Mobile trigger */}
        <button
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
        <div
          id="mobile-drawer"
          className="border-t border-teal/10 bg-cream lg:hidden"
        >
          <ul className="container-dama flex flex-col gap-1 py-4">
            {[{ href: '/cerita', label: 'Cerita' }, { href: '/menu', label: 'Menu' }].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block rounded px-2 py-3 text-body-lg text-ink hover:bg-teal/5"
                >
                  {l.label}
                </Link>
              </li>
            ))}

            <li className="px-2 pt-3 text-label font-semibold uppercase tracking-[0.18em] text-terracotta-deep">
              Sub-brand
            </li>
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

            {[
              { href: '/katering', label: 'Katering' },
              { href: '/hadiah', label: 'Hadiah' },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block rounded px-2 py-3 text-body-lg text-ink hover:bg-teal/5"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="px-2 pt-2">
              <Link
                href="/pesan"
                className="block min-h-[44px] rounded bg-terracotta px-5 py-3 text-center text-body font-medium text-cream"
              >
                Pesan
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
