import { ImageResponse } from 'next/og';

/**
 * Default OG image (§11): branded cream card with logo + tagline.
 * Applies site-wide via the file convention.
 */
export const runtime = 'edge';
export const alt = 'DAMA KITCHEN — Taraso Disayang';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F7F1E3',
          color: '#1F4D4D',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={{ fontSize: 96, fontWeight: 700, letterSpacing: 12 }}>DAMA</span>
          <span style={{ fontSize: 34, letterSpacing: 16, color: '#5A463C' }}>KITCHEN</span>
        </div>
        <div style={{ fontSize: 44, fontStyle: 'italic', marginTop: 16, color: '#C65B3E' }}>
          Taraso Disayang
        </div>
        <div style={{ fontSize: 24, marginTop: 28, color: '#5A463C' }}>
          Authentic Flavours. Made with Purpose.
        </div>
      </div>
    ),
    size,
  );
}
