'use client';

import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { SimplifiedPlaylistObject } from '@/app/types/playlistResponse';

export function useSpotifyData(session: any) {
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
        const data = await res.json();
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

  // User playlists
  useEffect(() => {
    if (!userToken) return;
    async function fetchPlaylists() {
      try {
        setPlaylistsLoading(true);
        setPlaylistsError(null);
        const res = await fetch('/api/spotify/playlists', {
          headers: { Authorization: `Bearer ${userToken}` },
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

  return {
    spotifyToken,
    spotifyTokenLoading,
    spotifyTokenError,

    userToken,
    userTokenLoading,
    userTokenError,

    userPlaylists,
    playlistsLoading,
    playlistsError,
  };
}
