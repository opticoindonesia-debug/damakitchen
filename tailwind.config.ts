import type { Config } from 'tailwindcss';

/**
 * DAMA KITCHEN brand theme.
 * All design tokens from the brand system (§3) live here.
 * No raw hex should appear in components — reference these tokens only.
 */
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
          DEFAULT: '#F7F1E3',
          deep: '#EFE6D2', // subtle surface step
          paper: '#FBF7EE',
        },
        // 20% structure. Deep teal carries the architecture.
        teal: {
          20: '#D2DEDB',
          40: '#A6BDB8',
          60: '#5E837D',
          80: '#356159',
          100: '#1F4D4D',
          DEFAULT: '#1F4D4D',
        },
        // 12% warmth. Core terracotta accent.
        terracotta: {
          20: '#F0D7CE',
          40: '#E2B0A1',
          60: '#D4866F',
          80: '#CB6B50',
          100: '#C65B3E',
          // AA-safe (≈5.2:1 on cream) for small terracotta TEXT on cream.
          // The base #C65B3E is ~3.8:1 — fine for large text/icons only.
          deep: '#A8472C',
          DEFAULT: '#C65B3E',
        },
        // 8% highlight. Gold — surfaces/accents, never body text on cream.
        gold: {
          20: '#EFE2C2',
          40: '#E0CA93',
          60: '#D2B264',
          80: '#CAA34B',
          100: '#C39A3C',
          DEFAULT: '#C39A3C',
        },
        // Warm ink for body text on cream (heritage brown).
        ink: {
          DEFAULT: '#33231C',
          soft: '#5A463C',
        },
        // Soft blush — surface/accent only (gifting). Never body text on cream.
        blush: {
          DEFAULT: '#E8C7C2',
          deep: '#D9A6A0',
        },
        // Festive accent — perayaan only, never a permanent surface.
        songketRed: '#C0392B',

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
