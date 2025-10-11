'use server';

import { auth } from '@/lib/auth';
import type { Session } from '@/lib/auth';
import { headers } from 'next/headers';
import { TrackObject, EpisodeObject } from '@/types/spotify/playlist';

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

// Get user access token if signed in, otherwise use Hueify account token if not
async function getAccessToken(): Promise<string> {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });

  if (session) {
    // User access token
    const tokenResponse = await auth.api.getAccessToken({
      body: { providerId: 'spotify' },
      headers: hdrs,
    });

    const accessToken = tokenResponse?.accessToken;
    if (!accessToken) throw new Error('No Spotify user access token available');
    return accessToken;
  }

  // Hueify Spotify account access token
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN!,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error('Failed to refresh Hueify access token: ' + text);
  }

  const data = await res.json();
  return data.access_token;
}

// Fetch user's playlists
export async function getUserPlaylists(offset = 0, limit = 20) {
  const accessToken = await getAccessToken();

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
  const accessToken = await getAccessToken();

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
  const accessToken = await getAccessToken();

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
  const accessToken = await getAccessToken();

  const res = await spotifyFetch(`https://api.spotify.com/v1/me/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: playlistName,
      description:
        "Feel free to change the description, but leave 'Hueify' somewhere in here to display which playlists have already been sorted on your dashboard.",
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
  const accessToken = await getAccessToken();

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
