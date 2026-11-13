import type { Metadata, Viewport } from 'next';
import {
  Cormorant_Garamond,
  DM_Serif_Display,
  Inter,
  Lato,
  Lora,
  Nunito_Sans,
  Playfair_Display,
  Poppins,
} from 'next/font/google';
import './globals.css';
import { site } from '@/content/site';
import { indexingEnabled } from '@/lib/indexing';

// Brand fonts (default) — preloaded.
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
});
const poppins = Poppins({ subsets: ['latin'], display: 'swap', weight: ['400', '500', '600'], variable: '--font-poppins' });

// Curated alternatives selectable in Admin → Tampilan. Not preloaded; the
// browser only downloads a font when the theme actually uses it.
const lora = Lora({ subsets: ['latin'], display: 'swap', weight: ['400', '700'], style: ['normal', 'italic'], variable: '--font-lora', preload: false });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], display: 'swap', weight: ['500', '700'], style: ['normal', 'italic'], variable: '--font-cormorant', preload: false });
const dmserif = DM_Serif_Display({ subsets: ['latin'], display: 'swap', weight: ['400'], style: ['normal', 'italic'], variable: '--font-dmserif', preload: false });
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter', preload: false });
const nunito = Nunito_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-nunito', preload: false, adjustFontFallback: false });
const lato = Lato({ subsets: ['latin'], display: 'swap', weight: ['400', '700'], variable: '--font-lato', preload: false });

const fontVars = [playfair, poppins, lora, cormorant, dmserif, inter, nunito, lato].map((f) => f.variable).join(' ');

/**
 * Site-wide defaults. Read at request time so staging protection and
 * verification tags follow the server environment without a rebuild.
 */
export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
    description: site.umbrellaPromise,
    applicationName: site.name,
    manifest: '/manifest.webmanifest',
    ...(indexingEnabled() ? {} : { robots: { index: false, follow: false } }),
    verification: {
      ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
      ...(process.env.BING_SITE_VERIFICATION ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } } : {}),
    },
  };
}

export const viewport: Viewport = {
  themeColor: site.themeColor,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
