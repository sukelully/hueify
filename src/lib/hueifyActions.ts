'use server';

import { getPlaylistTracks, createPlaylist, populatePlaylist } from '@/lib/actions';
import chroma from 'chroma-js';

// Main server action
export async function createHueifyPlaylistFromLink(playlistUrl: string, playlistName: string) {
  // Helper: extract playlist ID from a Spotify link
  const extractPlaylistId = (url: string) => {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)(\?|$)/);
    if (!match) throw new Error('Invalid Spotify playlist URL');
    return match[1];
  };

  const playlistId = extractPlaylistId(playlistUrl);

  // Fetch tracks from the original playlist
  const tracks = await getPlaylistTracks(playlistId);
  const uris = tracks.map((t) => t.uri);

  // Create a new playlist under Hueify
  const newPlaylistId = await createPlaylist(playlistName);

  // Populate the new playlist
  await populatePlaylist(newPlaylistId, uris);

  return `https://open.spotify.com/playlist/${newPlaylistId}`;
}

type TrackWithColor = {
  uri: string;
  dominantColor: [number, number, number];
};

// Simple LCH color extraction helper
const getLCH = (rgb: [number, number, number]) => {
  try {
    return chroma(rgb).lch() as [number, number, number];
  } catch {
    return [50, 0, 0];
  }
};

// Example: simple dominant color placeholder
const getDominantColor = (track: any) => {
  const img = track.album?.images?.[1]?.url || track.images?.[1]?.url;
  // For now you could return a placeholder RGB until you integrate ColorThief server-side or client-side
  return [128, 128, 128] as [number, number, number];
};

export async function createHueifySortedPlaylist(originalPlaylistId: string, name: string) {
  const tracks = await getPlaylistTracks(originalPlaylistId);
  const tracksWithColor: TrackWithColor[] = tracks.map((t) => ({
    uri: t.uri,
    dominantColor: getDominantColor(t),
  }));

  // Sort by LCH hue
  tracksWithColor.sort((a, b) => {
    const [lA, cA, hA] = getLCH(a.dominantColor);
    const [lB, cB, hB] = getLCH(b.dominantColor);

    const hueA = isNaN(hA) || cA < 5 ? 360 : hA;
    const hueB = isNaN(hB) || cB < 5 ? 360 : hB;

    if (Math.abs(hueA - hueB) > 15) return hueA - hueB;
    if (Math.abs(cA - cB) > 10) return cB - cA;
    return lB - lA;
  });

  const uris = tracksWithColor.map((t) => t.uri);

  const newPlaylistId = await createPlaylist(name);
  await populatePlaylist(newPlaylistId, uris);

  return `https://open.spotify.com/playlist/${newPlaylistId}`;
}

export async function createHueifyPlaylistFromUris(uris: string[], playlistName: string) {
  if (!uris.length) throw new Error('No tracks to add');

  // Create new Hueify playlist
  const newPlaylistId = await createPlaylist(playlistName);

  // Populate playlist in chunks
  await populatePlaylist(newPlaylistId, uris);

  return `https://open.spotify.com/playlist/${newPlaylistId}`;
}
