import Link from 'next/link';
import { Logo } from './Logo';
import { PatternBand } from './PatternBand';
import { subBrandList, type SubBrand } from '@/content/subbrands';
import { contact } from '@/content/channels';
import { site } from '@/content/site';

export interface FooterContact {
  umbrellaPromise: string;
  email: string;
  instagram: string;
  tiktok: string;
  threads: string;
}

/**
 * Footer (§6): logo + tagline, sub-brand links, channel links, contact,
 * "by DAMA" endorsement, social, copyright. Calm, on a teal ground.
 */
export function Footer({
  subBrands = subBrandList,
  settings,
}: {
  subBrands?: SubBrand[];
  settings?: FooterContact;
}) {
  const year = new Date().getFullYear();
  const promise = settings?.umbrellaPromise ?? site.umbrellaPromise;
  const email = settings?.email ?? contact.email;
  const igHref = settings?.instagram ?? contact.instagram.href;
  const ttHref = settings?.tiktok ?? contact.tiktok.href;
  const thHref = settings?.threads ?? contact.threads.href;

  return (
    <footer className="relative mt-section overflow-hidden bg-teal text-cream">
      <PatternBand motif="songket-geometric" opacity={0.05} />
      <div className="container-dama relative grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo variant="stacked" color="cream" withTagline />
          <p className="mt-5 max-w-xs text-caption text-cream/75">{promise}</p>
        </div>

        <nav aria-label="Sub-brand">
          <h2 className="mb-4 text-label font-semibold uppercase tracking-[0.18em] text-gold">
            Sub-brand
          </h2>
          <ul className="space-y-2.5">
            {subBrands.map((sb) => (
              <li key={sb.slug}>
                <Link
                  href={`/${sb.slug}`}
                  className="inline-flex items-center gap-2 text-caption text-cream/85 hover:text-cream"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: sb.markerHex }}
                  />
                  {sb.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Tautan">
          <h2 className="mb-4 text-label font-semibold uppercase tracking-[0.18em] text-gold">
            Jelajahi
          </h2>
          <ul className="space-y-2.5 text-caption text-cream/85">
            <li>
              <Link href="/cerita" className="hover:text-cream">
                Cerita
              </Link>
            </li>
            <li>
              <Link href="/menu" className="hover:text-cream">
                Menu
              </Link>
            </li>
            <li>
              <Link href="/katering" className="hover:text-cream">
                Katering
              </Link>
            </li>
            <li>
              <Link href="/hadiah" className="hover:text-cream">
                Hadiah
              </Link>
            </li>
            <li>
              <Link href="/pesan" className="hover:text-cream">
                Di mana memesan
              </Link>
            </li>
            <li>
              <Link href="/kontak" className="hover:text-cream">
                Kontak
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-label font-semibold uppercase tracking-[0.18em] text-gold">
            Sapa kami
          </h2>
          <ul className="space-y-2.5 text-caption text-cream/85">
            <li>
              <a href={`mailto:${email}`} className="hover:text-cream">
                {email}
              </a>
            </li>
            <li>
              <a href={igHref} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                Instagram {contact.instagram.handle}
              </a>
            </li>
            <li>
              <a href={ttHref} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                TikTok {contact.tiktok.handle}
              </a>
            </li>
            <li>
              <a href={thHref} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                Threads {contact.threads.handle}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/15">
        <div className="container-dama flex flex-col gap-2 py-6 text-caption text-cream/65 sm:flex-row sm:items-center sm:justify-between">
          <p>Setiap lini disajikan {site.hashtag} — by DAMA.</p>
          <p>
            © {year} {site.name}. {site.tagline}.
          </p>
        </div>
      </div>
    </footer>
  );
}
