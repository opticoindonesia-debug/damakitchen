import type { SVGProps } from 'react';

/**
 * DAMA line icons (§4.4): 2px stroke, 24×24 grid, rounded corners,
 * single color via currentColor, no solid fills.
 * lucide-react is used only as a fallback for generic UI chrome.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/** panaskan — reheat (steaming bowl). */
export function IconReheat(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 13h16a8 8 0 0 1-16 0Z" />
      <path d="M9 6c0 1-1 1.5-1 2.5S9 10 9 11" />
      <path d="M15 6c0 1-1 1.5-1 2.5s1 1.5 1 2.5" />
    </Base>
  );
}

/** porsi — portion (plate with fork & knife). */
export function IconPortion(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx={12} cy={13} r={6} />
      <circle cx={12} cy={13} r={2.5} />
      <path d="M4 3v5M21 3v5" />
    </Base>
  );
}

/** masa-simpan — shelf life (clock). */
export function IconShelfLife(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx={12} cy={12} r={8} />
      <path d="M12 8v4l3 2" />
    </Base>
  );
}

/** halal — verified mark. */
export function IconHalal(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3 4 6v6c0 4 3.5 7 8 9 4.5-2 8-5 8-9V6Z" />
      <path d="m9 12 2 2 4-4" />
    </Base>
  );
}

/** pedas — spicy (chili). */
export function IconSpicy(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 18c6 0 11-4 12-11" />
      <path d="M18 7c0-2 1-3 3-3-1 2 0 3 0 3" />
      <path d="M6 18c-2 0-3-1-3-3 2 1 3 0 3 0" />
    </Base>
  );
}

/** sambal-terpisah — sambal separate (two small bowls). */
export function IconSambalSeparate(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 11h7a3.5 3.5 0 0 1-7 0Z" />
      <path d="M14 11h7a3.5 3.5 0 0 1-7 0Z" />
      <path d="M6.5 8c0-.8-.5-1-.5-1.8M17.5 8c0-.8-.5-1-.5-1.8" />
    </Base>
  );
}

/** reusable — reusable packaging (recycle-ish loop). */
export function IconReusable(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M7 7 4 12l3 1" />
      <path d="M12 4l3 5-3 1" />
      <path d="M20 12l-2 5-3-1" />
      <path d="M4 12a8 8 0 0 0 14 4" />
    </Base>
  );
}

/** kirim-aman — safe shipping (protected box). */
export function IconSafeShipping(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3 4 6v5c0 4 3.5 7 8 8 4.5-1 8-4 8-8V6Z" />
      <path d="M12 8v6M9 11h6" />
    </Base>
  );
}

// ── Pillar icons (§5.3) ──────────────────────────────────────

/** Authentic Recipes — open recipe book. */
export function IconRecipe(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 6c-2-1.5-4-1.5-7-1v12c3-.5 5-.5 7 1 2-1.5 4-1.5 7-1V5c-3-.5-5-.5-7 1Z" />
      <path d="M12 6v13" />
    </Base>
  );
}

/** Made with Care — hand holding heart. */
export function IconCare(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 9c-1.2-1.6-4-1.2-4 1 0 1.8 2.4 3.4 4 4.5 1.6-1.1 4-2.7 4-4.5 0-2.2-2.8-2.6-4-1Z" />
      <path d="M5 14c0 3 2.5 5 7 5s7-2 7-5" />
    </Base>
  );
}

/** Quality Ingredients — leaf sprig. */
export function IconIngredients(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 19c0-7 5-12 14-13-1 9-6 14-13 14" />
      <path d="M9 15c2-2 4-3 7-4" />
    </Base>
  );
}

/** Shared with Love — bowl with heart steam. */
export function IconLove(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 12h18a9 9 0 0 1-18 0Z" />
      <path d="M12 8c-.8-1-2.5-.6-2.5.6 0 .9 1.5 1.8 2.5 2.4 1-.6 2.5-1.5 2.5-2.4C14.5 7.4 12.8 7 12 8Z" />
    </Base>
  );
}

export const infoIconMap = {
  panaskan: IconReheat,
  porsi: IconPortion,
  'masa-simpan': IconShelfLife,
  halal: IconHalal,
  pedas: IconSpicy,
  'sambal-terpisah': IconSambalSeparate,
  reusable: IconReusable,
  'kirim-aman': IconSafeShipping,
} as const;

export const pillarIconMap = {
  recipe: IconRecipe,
  care: IconCare,
  ingredients: IconIngredients,
  love: IconLove,
} as const;
