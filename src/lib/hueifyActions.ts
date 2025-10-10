'use server';
import { TrackObject, EpisodeObject } from '@/types/spotify/playlist';

async function getHueifyAccessToken(): Promise<string> {
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

// Fetch playlist info
export async function getHueifyPlaylist(playlistId: string) {
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
export async function getHueifyPlaylistTracks(playlistId: string, additional_types = 'track') {
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
export async function createHueifyPlaylist(playlistName: string) {
  const accessToken = await getHueifyAccessToken();

  const res = await spotifyFetch(`https://api.spotify.com/v1/me/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: playlistName,
      description:
        'Now save this playlist to your library or add the songs to your own playlist :)',
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
export async function populateHueifyPlaylist(playlistId: string, uris: string[]) {
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
