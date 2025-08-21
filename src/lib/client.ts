import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient();

export const signInWithSpotify = async () => {
  try {
    const data = await authClient.signIn.social({
      provider: 'spotify',
      // redirectUrl: window.location.origin,
    });
    console.log('Redirecting to Spotify for login...');
  } catch (err) {
    console.error('Spotify sign-in failed', err);
  }
};
