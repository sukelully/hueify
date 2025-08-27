import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from '@/lib/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: ['http://127.0.0.1:3000'],
  socialProviders: {
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      redirectURI: 'http://127.0.0.1:3000/api/auth/callback/spotify',
    },
  },
  session: {
    cookieCache: {
      enable: true,
      maxAge: 5 * 60,
    },
  },
});
