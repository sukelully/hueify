'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { TrackObject, EpisodeObject } from '@/types/spotify/playlist';

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

// Fetch playlist
export async function getPlaylist(playlistId: string) {
  const accessToken = await getAccessToken();

  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Spotify fetch error:', text);
    throw new Error(`Failed to fetch playlist ${playlistId}`);
  }

  const data = await res.json();
  return data;
}

// Fetch all tracks from a specific playlist
export async function getPlaylistTracks(playlistId: string, additional_types: string = 'track') {
  const accessToken = await getAccessToken();
  const allTracks: (TrackObject | EpisodeObject)[] = [];
  let offset = 0;
  const limit = 100; // Max allowed by Spotify

  while (true) {
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

    // Extract only the tracks (filter out nulls)
    const items = data.items?.map((item: any) => item.track).filter(Boolean) || [];
    allTracks.push(...items);

    if (!data.next) break; // No more pages
    offset += limit; // Move to the next page
  }

  return allTracks;
}

// Get Spotify user ID - ARCHIVE
export async function getUserId() {
  const accessToken = await getAccessToken();

  const res = await fetch(
    `
    https://api.spotify.com/v1/me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error('Spotify fetch error:', text);
    throw new Error('Failed to fetch Spotify user ID');
  }

  const data = await res.json();
  return data.id;
}

// Create public playlist, returns playlist ID
export async function createPlaylist(playlistName: string) {
  const accessToken = await getAccessToken();

  const playlistData = {
    name: playlistName,
    description: 'Sorted by color with Hueify',
  };

  const res = await fetch(`https://api.spotify.com/v1/me/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(playlistData),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Spotify create playlist error:', text);
    throw new Error('Failed to create new playlist');
  }

  const data = await res.json();
  return data.id;
}

// Add tracks to playlist
export async function populatePlaylist(playlistId: string, uris: string[]) {
  const CHUNK_SIZE = 100;
  const accessToken = await getAccessToken();

  for (let i = 0; i < uris.length; i += CHUNK_SIZE) {
    const chunk = uris.slice(i, i + CHUNK_SIZE);

    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: chunk }), // <-- append automatically
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Spotify populate playlist error', text);
      throw new Error('Failed to add tracks to playlist');
    }
  }
}
