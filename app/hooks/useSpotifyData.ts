'use client';

import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { SimplifiedPlaylistObject } from '@/app/types/playlistResponse';

type Session = typeof authClient extends { useSession: () => { data: infer S } } ? S : unknown;

export function useSpotifyData(session: Session) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [accessTokenLoading, setAccessTokenLoading] = useState(false);
  const [accessTokenError, setAccessTokenError] = useState<Error | null>(null);

  const [userPlaylists, setUserPlaylists] = useState<SimplifiedPlaylistObject[] | null>(null);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [playlistsError, setPlaylistsError] = useState<Error | null>(null);

  async function fetchPlaylists(offset: number = 0, limit: number = 20) {
    try {
      setPlaylistsLoading(true);
      setPlaylistsError(null);
      const res = await fetch(`/api/spotify/playlists?limit=${limit}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
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

  // Fetch access token
  useEffect(() => {
    async function fetchAccessToken() {
      try {
        setAccessTokenLoading(true);
        setAccessTokenError(null);

        const tokenResponse = await authClient.getAccessToken({
          providerId: 'spotify',
        });

        const userAccessToken = tokenResponse.data?.accessToken;
        if (userAccessToken) setAccessToken(userAccessToken);
      } catch (err) {
        console.error('Failed to fetch acess token', err);
        setAccessTokenError(err instanceof Error ? err : new Error('Unknown access token error'));
      } finally {
        setAccessTokenLoading(false);
      }
    }

    fetchAccessToken();
  }, [session]);

  // User playlists
  useEffect(() => {
    if (!accessToken) return;


    fetchPlaylists();
  }, [accessToken]);

  return {
    accessToken,
    accessTokenLoading,
    accessTokenError,

    userPlaylists,
    fetchPlaylists,
    playlistsLoading,
    playlistsError,
  };
}
