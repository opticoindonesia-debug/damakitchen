import { ImageResponse } from 'next/og';

/** Apple touch icon — monogram seal (§11). */
export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1F4D4D',
          color: '#F7F1E3',
          fontSize: 120,
          fontWeight: 700,
          fontFamily: 'Georgia, serif',
        }}
      >
        D
      </div>
    ),
    size,
  );
}
