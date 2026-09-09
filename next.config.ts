import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  // Disable image optimization (requires server)
  images: {
    unoptimized: true,
  },
  // Trailing slash for static file serving
  trailingSlash: true,
};

export default nextConfig;
