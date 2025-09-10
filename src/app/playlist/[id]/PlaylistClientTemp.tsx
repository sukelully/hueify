'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import ColorThief from 'colorthief';
import { PlaylistResponse, TrackObject, EpisodeObject } from '@/types/spotify/playlist';
import chroma from 'chroma-js';
import { createPlaylist, populatePlaylist, getPlaylistTracks } from '@/lib/actions';

type ProcessedTrack = {
  track: TrackObject | EpisodeObject;
  dominantColor: [number, number, number];
  colorPalette: [number, number, number][];
  lch: [number, number, number]; // Pre-calculated for sorting
};

type SortedPlaylistProps = {
  playlist: PlaylistResponse;
};

const FALLBACK_COLOR: [number, number, number] = [128, 128, 128];
const FALLBACK_IMAGE = '/spotify/spotify-green.png';
const IMAGE_LOAD_TIMEOUT = 8000;
const BATCH_SIZE = 5;

export default function SortedPlaylist({ playlist }: SortedPlaylistProps) {
  const [processedTracks, setProcessedTracks] = useState<ProcessedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [totalTracks, setTotalTracks] = useState(0);

  const savePlaylist = async () => {
    const playlistName = `${playlist.name} hueify test`;
    const playlistId = await createPlaylist(playlistName);
    await populatePlaylist(playlistId, sortedTrackUris);
  };

  // Extract artwork URL
  const getArtworkUrl = (track: TrackObject | EpisodeObject, index: number = 1): string => {
    if (index < 0 || index > 2) {
      throw new Error('Error: requested artwork index is out of range');
    }
    const images = 'album' in track ? track.album?.images : track.images;

    if (!images?.length) return FALLBACK_IMAGE;

    // Prefer low resolution images for better performance
    return images[index]?.url || images[2]?.url || FALLBACK_IMAGE;
  };

  // Process a single track's color data
  const processTrackColor = async (
    track: TrackObject | EpisodeObject,
    thief: ColorThief
  ): Promise<ProcessedTrack> => {
    const artworkUrl = getArtworkUrl(track);

    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      const { dominantColor, palette } = await new Promise<{
        dominantColor: [number, number, number];
        palette: [number, number, number][];
      }>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Image load timeout'));
        }, IMAGE_LOAD_TIMEOUT);

        img.onload = () => {
          clearTimeout(timeout);
          try {
            const dominantColor = thief.getColor(img, 2) as [number, number, number];
            const palette = (thief.getPalette(img, 5) as [number, number, number][]) || [
              dominantColor,
            ];

            resolve({ dominantColor, palette });
          } catch (colorError) {
            console.warn(`ColorThief failed for ${track.name}:`, colorError);
            resolve({
              dominantColor: FALLBACK_COLOR,
              palette: [FALLBACK_COLOR],
            });
          }
        };

        img.onerror = () => {
          clearTimeout(timeout);
          console.warn(`Failed to load image for ${track.name}:`, artworkUrl);
          resolve({
            dominantColor: FALLBACK_COLOR,
            palette: [FALLBACK_COLOR],
          });
        };

        img.src = artworkUrl;
      });

      // Pre-calculate LCH for sorting
      const lch = getLCH(dominantColor);

      return {
        track,
        dominantColor,
        colorPalette: palette,
        lch,
      };
    } catch (error) {
      console.warn(`Error processing ${track.name}:`, error);
      return {
        track,
        dominantColor: FALLBACK_COLOR,
        colorPalette: [FALLBACK_COLOR],
        lch: getLCH(FALLBACK_COLOR),
      };
    }
  };

  // Convert from RGB to LCH colors
  const getLCH = (rgb: [number, number, number]): [number, number, number] => {
    try {
      return chroma(rgb).lch() as [number, number, number];
    } catch {
      return [50, 0, 0]; // Neutral gray fallback
    }
  };

  // Process tracks in batches
  const processTracksInBatches = async (tracks: (TrackObject | EpisodeObject)[]) => {
    const thief = new ColorThief();
    const results: ProcessedTrack[] = [];

    for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
      const batch = tracks.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(batch.map((track) => processTrackColor(track, thief)));

      results.push(...batchResults);
      setProgress(results.length);

      // Update state after each batch for progressive loading
      setProcessedTracks([...results]);
    }

    return results;
  };

  // Improved sorting with better hue handling
  const sortedTracks = useMemo(() => {
    return [...processedTracks].sort((a, b) => {
      const [lA, cA, hA] = a.lch;
      const [lB, cB, hB] = b.lch;

      // Primary sort: Hue (with special handling for grayscale)
      const hueA = isNaN(hA) || cA < 5 ? 360 : hA; // Put grayscale at end
      const hueB = isNaN(hB) || cB < 5 ? 360 : hB;

      if (Math.abs(hueA - hueB) > 15) {
        // Increased tolerance for smoother transitions
        return hueA - hueB;
      }

      // Secondary sort: Chroma (saturation) - more saturated first
      if (Math.abs(cA - cB) > 10) {
        return cB - cA;
      }

      // Tertiary sort: Lightness - darker first within same hue/chroma
      return lA - lB;
    });
  }, [processedTracks]);

  // Process tracks
  useEffect(() => {
    const processColors = async () => {
      const tracks = await getPlaylistTracks(playlist.id); // fetch ALL tracks
      if (tracks.length === 0) {
        setIsLoading(false);
        return;
      }

      setTotalTracks(tracks.length);

      console.log(`Processing colors for ${tracks.length} tracks...`);
      try {
        await processTracksInBatches(tracks);
        console.log('Color processing complete!');
      } catch (error) {
        console.error('Error processing playlist colors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    processColors();
  }, [playlist.id]);

  // Extract uris directly from sortedTracks
  const sortedTrackUris = useMemo(
    () =>
      sortedTracks
        .map((item) => ('uri' in item.track && item.track.uri ? item.track.uri : null))
        .filter((uri): uri is string => uri !== null),
    [sortedTracks]
  );

  if (!playlist.tracks.items.length) {
    return (
      <div className="relative min-h-screen p-4">
        <DashboardChevron />
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-700">
            No tracks found in this playlist.
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-4">
      <DashboardChevron />

      <div className="flex flex-col items-center gap-6 pt-24 md:pt-28">
        <h1 className="font-corben text-3xl font-bold md:text-4xl">{playlist.name}</h1>
        <button
          onClick={savePlaylist}
          className="btn hover:bg-black-active active:bg-black-active cursor-pointer rounded-lg bg-black px-4 py-2 font-semibold text-white transition dark:bg-white dark:text-black"
        >
          Save playlist to Spotify
        </button>

        {isLoading && (
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <div>Processing colors...</div>
            <div className="text-sm">
              {progress} / {totalTracks} tracks
            </div>
            <div className="flex h-4 w-full justify-start rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-black transition-all duration-300 dark:bg-white"
                style={{
                  width: `${(progress / totalTracks) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        <ul className="scrollbar-thin scrollbar-thumb-gray-400 grid grid-cols-4 gap-4 overflow-y-auto px-4 pb-4">
          {sortedTracks.map((item, index) => {
            const src = getArtworkUrl(item.track, 1);
            const title = item.track.name || 'Unknown Track';
            const [r, g, b] = item.dominantColor;
            const [L, C, H] = item.lch;

            return (
              <li
                key={`${item.track.id}-${index}`}
                className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200"
                title={`${title} - RGB(${r}, ${g}, ${b}) - LCH(${L.toFixed(0)}, ${C.toFixed(0)}, ${H.toFixed(0)})`}
              >
                {/* Album Cover */}
                <div className="relative h-24 w-24 md:h-32 md:w-32">
                  <NextImage
                    src={src}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 96px, 128px"
                    className="rounded-lg object-cover"
                    unoptimized
                  />
                </div>

                <div
                  className="h-6 w-6 rounded-full border border-gray-300 shadow-sm"
                  style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                />
                <div className="grid grid-cols-5">
                  {item.colorPalette.map((color, index) => (
                    <div
                      key={index}
                      className="h-4 w-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
                    />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function DashboardChevron() {
  return (
    <Link
      href="/dashboard"
      className="hover:bg-white-active active:bg-white-active fixed top-16 left-4 z-5 cursor-pointer rounded-lg p-2 transition-colors duration-300 md:top-20 md:left-20"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="text-foreground h-8 w-8"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}
