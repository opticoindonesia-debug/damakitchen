/** Tiny classnames joiner — keeps conditional Tailwind classes readable. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/** Convert a #RRGGBB hex into a space-separated "r g b" triple for CSS vars. */
export function hexToRgbTriple(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** "Rp 85.000" — Indonesian Rupiah, no decimals. */
export function formatRupiah(value: number): string {
  return `Rp ${Math.round(value).toLocaleString('id-ID')}`;
}

/** "@damakitchen" from a social profile URL (falls back to the host). */
export function socialHandle(url: string): string {
  try {
    const u = new URL(url);
    const seg = u.pathname.split('/').filter(Boolean)[0];
    if (!seg) return u.hostname.replace(/^www\./, '');
    return seg.startsWith('@') ? seg : `@${seg}`;
  } catch {
    return url;
  }
}
