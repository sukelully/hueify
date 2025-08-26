'use client';

import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import SignInBtn from '@/app/components/misc/SignInBtn';
import PlaylistCard from '@/app/components/Dashboard/PlaylistCard';
import { SimplifiedPlaylistObject } from '../types/playlistResponse';

export default function Dashboard() {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const router = useRouter();

  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [spotifyTokenLoading, setSpotifyTokenLoading] = useState(false);
  const [spotifyTokenError, setSpotifyTokenError] = useState<Error | null>(null);

  const [userToken, setUserToken] = useState<string | null>(null);
  const [userTokenLoading, setUserTokenLoading] = useState(false);
  const [userTokenError, setUserTokenError] = useState<Error | null>(null);

  const [userPlaylists, setUserPlaylists] = useState<SimplifiedPlaylistObject[] | null>(null);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [playlistsError, setPlaylistsError] = useState<Error | null>(null);

  // Fetch Spotify access token
  useEffect(() => {
    async function fetchToken() {
      try {
        setSpotifyTokenLoading(true);
        setSpotifyTokenError(null);

        const res = await fetch('/api/spotify/token');
        // console.log('Spotify token response status:', res.status);
        const data = await res.json();
        // console.log('Spotify token response body:', data);
        setSpotifyToken(data.access_token);
      } catch (err) {
        console.error('Failed to fetch Spotify token:', err);
        setSpotifyTokenError(
          err instanceof Error ? err : new Error('Unknown Spotify access token error')
        );
      } finally {
        setSpotifyTokenLoading(false);
      }
    }

    fetchToken();
  }, [session]);

  // Fetch OAuth access token
  useEffect(() => {
    async function fetchUsertoken() {
      try {
        setUserTokenLoading(true);
        setUserTokenError(null);

        const tokenResponse = await authClient.getAccessToken({
          providerId: 'spotify',
        });

        const userAccessToken = tokenResponse.data?.accessToken;
        if (userAccessToken) setUserToken(userAccessToken);
      } catch (err) {
        console.error('Failed to fetch user acess token', err);
        setUserTokenError(
          err instanceof Error ? err : new Error('Unknown user access token error')
        );
      } finally {
        setUserTokenLoading(false);
      }
    }

    fetchUsertoken();
  }, [session]);

  // Fetch user playlists
  useEffect(() => {
    if (!userToken) return;

    async function fetchPlaylists() {
      try {
        setPlaylistsLoading(true);
        setPlaylistsError(null);

        const res = await fetch('/api/spotify/playlists', {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch playlists');
        const data = await res.json();
        setUserPlaylists(data.items);
      } catch (err) {
        setPlaylistsError(
          err instanceof Error ? err : new Error('Unknown error fetching user playlists')
        );
      } finally {
        setPlaylistsLoading(false);
      }
    }

    fetchPlaylists();
  }, [userToken]);

  // Show loading state
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">Loading session...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error('Session error:', error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="cursor-pointer text-red-500">Error fetching session: {error.message}</p>
      </div>
    );
  }

  // If not signed in, prompt to sign in
  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-xl">You are not signed in.</p>
        <SignInBtn />
      </div>
    );
  }

  // Signed-in dashboard
  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-6 p-8 sm:p-20">
      <h1 className="mb-2 text-4xl font-bold">Welcome, {session.user.name}!</h1>

      <p className="text-gray-700">Your email: {session.user.email}</p>

      <div className="mt-4 flex gap-4">
        <button
          className="cursor-pointer rounded-lg bg-red-500 px-6 py-2 text-white hover:bg-red-600"
          onClick={() => signOut(router)}
        >
          Sign Out
        </button>

        <button
          className="cursor-pointer rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          onClick={() => {
            console.log('Refetching session...');
            refetch();
          }}
        >
          Refresh Session
        </button>
      </div>

      <div className="mt-6 w-full max-w-2xl">
        {playlistsLoading && <p>Loading playlists...</p>}
        {playlistsError && <p className="text-red-500">{playlistsError.message}</p>}
        {userPlaylists && (
          <ul className="space-y-2">
            {userPlaylists.map((pl: SimplifiedPlaylistObject) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </ul>
        )}
      </div>

      <pre className="w-full max-w-2xl overflow-auto rounded-lg bg-gray-100 p-4">
        {/* {JSON.stringify(spotifyToken, null, 2)} */}
        {/* {JSON.stringify(session, null, 2)} */}
      </pre>
    </div>
  );
}
