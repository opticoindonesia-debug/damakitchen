/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Sanity Studio uses styled-components.
  compiler: {
    styledComponents: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Sanity image CDN (CMS-hosted photography).
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
};

export default nextConfig;
