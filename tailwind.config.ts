import type { Config } from 'tailwindcss';

/**
 * DAMA KITCHEN brand theme.
 * All design tokens from the brand system (§3) live here.
 * No raw hex should appear in components — reference these tokens only.
 */
/**
 * Palette colors are CSS variables ("r g b" triples) so they can be edited in
 * Studio at runtime (see lib/theme.ts). Defaults live in app/globals.css.
 */
const v = (token: string) => `rgb(var(--c-${token}) / <alpha-value>)`;

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Core palette (§3.1) ──────────────────────────────
        // ~60% canvas. Warm paper, never cold studio white.
        cream: {
          DEFAULT: v('cream'),
          deep: v('cream-deep'), // subtle surface step
          paper: v('cream-paper'),
        },
        // 20% structure. Deep teal carries the architecture.
        teal: {
          20: v('teal-20'),
          40: v('teal-40'),
          60: v('teal-60'),
          80: v('teal-80'),
          100: v('teal-100'),
          DEFAULT: v('teal-100'),
        },
        // 12% warmth. Core terracotta accent.
        terracotta: {
          20: v('terracotta-20'),
          40: v('terracotta-40'),
          60: v('terracotta-60'),
          80: v('terracotta-80'),
          100: v('terracotta-100'),
          // Darker step for small terracotta TEXT on cream (AA).
          deep: v('terracotta-deep'),
          DEFAULT: v('terracotta-100'),
        },
        // 8% highlight. Gold — surfaces/accents, never body text on cream.
        gold: {
          20: v('gold-20'),
          40: v('gold-40'),
          60: v('gold-60'),
          80: v('gold-80'),
          100: v('gold-100'),
          DEFAULT: v('gold-100'),
        },
        // Warm ink for body text on cream (heritage brown).
        ink: {
          DEFAULT: v('ink'),
          soft: v('ink-soft'),
        },
        // Soft blush — surface/accent only (gifting). Never body text on cream.
        blush: {
          DEFAULT: v('blush'),
          deep: v('blush-deep'),
        },
        // Festive accent — perayaan only, never a permanent surface.
        songketRed: v('festive'),

        // ── Sub-brand markers (§3.2) ─────────────────────────
        // One marker per line; always sits on the shared cream/ink base.
        marker: {
          lamak: '#1F7A6E', // LAMAK DAMA — Tenang (calm teal-green)
          warisan: '#9E3F22', // WARISAN DAMA — Bangga (deeper terracotta — distinct token)
          hidang: '#B5792B', // HIDANG BASAMO — Hangat (warm amber)
          kapau: '#5E7B52', // DAMA KAPAU — Lega (calm sage)
          tando: '#B86B74', // TANDO MATO — Berkesan (blush-rose)
        },

        // Dynamic per-page accent (set via CSS var on sub-brand pages).
        accent: 'rgb(var(--accent) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-poppins)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Responsive type scale (§3.4) — fluid clamps, web-translated.
        'display-xl': ['clamp(2.75rem, 6vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        'display-lg': ['clamp(2.25rem, 4.5vw, 3.25rem)', { lineHeight: '1.1' }],
        'display-md': ['clamp(1.75rem, 3vw, 2.25rem)', { lineHeight: '1.15' }],
        'heading': ['clamp(1.375rem, 2vw, 1.625rem)', { lineHeight: '1.25' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body': ['1rem', { lineHeight: '1.65' }],
        'caption': ['0.875rem', { lineHeight: '1.6' }],
        'label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.08em' }],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '12px',
        lg: '20px',
      },
      boxShadow: {
        // Single soft, teal-tinted elevation token (§3.5).
        soft: '0 8px 30px -12px rgba(31,77,77,0.18)',
      },
      maxWidth: {
        container: '1200px',
        prose: '68ch',
      },
      spacing: {
        section: 'clamp(4rem, 10vw, 8rem)',
        gutter: 'clamp(1.5rem, 5vw, 3rem)',
      },
      transitionTimingFunction: {
        calm: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 500ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
