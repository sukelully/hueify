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
      },
    ],
  },
  experimental: {
    useCache: true,
    // serverActions: {
    //   allowedOrigins: ['http://127.0.0.1:3000', 'https://hueify.vercel.app']
    // }
  },
  // allowedDevOrigins: ['http://127.0.0.1:3000', 'https://hueify.vercel.app']
};

export default nextConfig;
