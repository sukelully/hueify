'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { TrackObject, EpisodeObject } from '@/types/spotify/playlist';
import { getHueifyAccessToken } from './hueifyAuth';

// Wrapper for fetch that handles Spotify rate limits (429)
async function spotifyFetch(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options);

    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('Retry-After') || '1', 10);
      console.warn(`Rate limited (attempt ${attempt + 1}). Retrying after ${retryAfter}s...`);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      continue;
    }

    return res;
  }

  throw new Error(`Spotify API rate limit exceeded after ${maxRetries} retries`);
}

// Get Spotify access token
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
export async function getUserPlaylists(offset = 0, limit = 20) {
  const accessToken = await getHueifyAccessToken();

  const res = await spotifyFetch(
    `https://api.spotify.com/v1/me/playlists?offset=${offset}&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch Spotify playlists: ${text}`);
  }

  const data = await res.json();
  return data.items;
}

// Fetch playlist info
export async function getPlaylist(playlistId: string) {
  const accessToken = await getHueifyAccessToken();

  const res = await spotifyFetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Spotify fetch error:', text);
    throw new Error(`Failed to fetch playlist ${playlistId}`);
  }

  return await res.json();
}

// Fetch all tracks from a playlist
export async function getPlaylistTracks(playlistId: string, additional_types = 'track') {
  const accessToken = await getHueifyAccessToken();
  const allTracks: (TrackObject | EpisodeObject)[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await spotifyFetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}&additional_types=${additional_types}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('Spotify fetch error:', text);
      throw new Error(`Failed to fetch tracks for playlist ${playlistId}`);
    }

    const data = await res.json();
    const items = data.items?.map((item: any) => item.track).filter(Boolean) || [];
    allTracks.push(...items);

    if (!data.next) break;
    offset += limit;
  }

  return allTracks;
}

// Create a new public playlist
export async function createPlaylist(playlistName: string) {
  const accessToken = await getHueifyAccessToken();

  const res = await spotifyFetch(`https://api.spotify.com/v1/me/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: playlistName,
      description: 'Sorted by color with Hueify.',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Spotify create playlist error:', text);
    throw new Error('Failed to create new playlist');
  }

  const data = await res.json();
  return data.id;
}

// Add tracks to a playlist, handling code 429 per chunk
export async function populatePlaylist(playlistId: string, uris: string[]) {
  const CHUNK_SIZE = 100;
  const accessToken = await getHueifyAccessToken();

  for (let i = 0; i < uris.length; i += CHUNK_SIZE) {
    const chunk = uris.slice(i, i + CHUNK_SIZE);

    const res = await spotifyFetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: chunk }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Spotify populate playlist error', text);
      throw new Error('Failed to add tracks to playlist');
    }
  }
}
