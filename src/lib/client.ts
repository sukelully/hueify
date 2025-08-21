import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: "http://127.0.0.1:3000"
});

export const signInWithSpotify = () => {
  authClient.signIn.social({
    provider: "spotify",
    callbackURL: "http://127.0.0.1:3000/api/auth/callback/spotify",
  });
};