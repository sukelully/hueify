import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from '@/lib/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: ['http://127.0.0.1:3000', 'https://hueify.vercel.app'],
  socialProviders: {
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      redirectURI: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI!,
      scope: [
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-public',
        'playlist-modify-private',
      ],
    },
  },
  session: {
    cookieCache: {
      enable: true,
      maxAge: 5 * 60,
    },
  },
  advanced: {
    useSecureCookies: true,
  },
});

export type Session = typeof auth.$Infer.Session;
