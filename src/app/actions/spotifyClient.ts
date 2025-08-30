'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function getAccessToken(): Promise<string> {
  const tokenResponse = await auth.api.getAccessToken({
    body: { providerId: 'spotify' },
    headers: await headers(),
  });

  const accessToken = tokenResponse?.accessToken;
  if (!accessToken) throw new Error('No Spotify access token available');
  return accessToken;
}

// Fetch user's playlists
export async function getUserPlaylists(offset: number = 0, limit: number = 20) {
  const accessToken = await getAccessToken();

  const res = await fetch(
    `https://api.spotify.com/v1/me/playlists?offset=${offset}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) throw new Error('Failed to fetch Spotify playlists');

  const data = await res.json();
  return data.items;
}

// Fetch specific playlist tracks
export async function getPlaylistTracks(
  playlistId: string,
  offset: number = 0,
  limit: number = 20,
  additional_types: string = 'track'
) {
  const accessToken = await getAccessToken();

  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}&additional_types=${additional_types}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error('Spotify fetch error:', text);
    throw new Error(`Failed to fetch tracks for playlist ${playlistId}`);
  }

  const data = await res.json();
  return data.items;
}
