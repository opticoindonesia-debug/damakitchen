/** @type {import('next').NextConfig} */

// Security headers for every response. The admin is same-origin only.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'" },
];

const nextConfig = {
  reactStrictMode: true,
  // Self-contained server build (node .next/standalone/server.js) for Hostinger / any Node host.
  output: 'standalone',
  poweredByHeader: false,
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'mysql2'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
};

export default nextConfig;
