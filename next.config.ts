import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'mosaic.scdn.co',
      },
      {
        protocol: 'https',
        hostname: '**.spotifycdn.com',
      }
    ],
  },
  // allowedDevOrigins: ['http://127.0.0.1:3000']
};

export default nextConfig;
