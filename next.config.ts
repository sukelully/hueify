import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
  },
  // allowedDevOrigins: ['http://127.0.0.1:3000']
};

export default nextConfig;
