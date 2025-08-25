import { createAuthClient } from 'better-auth/react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export const authClient = createAuthClient();

export const signIn = async () => {
  await authClient.signIn.social({
    provider: 'spotify',
    callbackURL: '/dashboard',
  });
};

export const signOut = async (router: AppRouterInstance) => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push('/');
      },
    },
  });
};
