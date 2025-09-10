'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  lch: [number, number, number];
};

type SortedPlaylistProps = {
  playlist: PlaylistResponse;
};

const FALLBACK_COLOR: [number, number, number] = [128, 128, 128];
const FALLBACK_IMAGE = '/spotify/spotify-green.png';
const IMAGE_LOAD_TIMEOUT = 8000;
const BATCH_SIZE = 5;
const PALETTE_SIZE = 8; // Increased for better selection
const MIN_SATURATION_THRESHOLD = 0.15; // Minimum saturation for color selection
const MIN_LIGHTNESS_THRESHOLD = 0.1; // Avoid very dark colors
const MAX_LIGHTNESS_THRESHOLD = 0.95; // Avoid very light colors

export default function SortedPlaylist({ playlist }: SortedPlaylistProps) {
  const [processedTracks, setProcessedTracks] = useState<ProcessedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [totalTracks, setTotalTracks] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const savePlaylist = async () => {
    try {
      const playlistName = `${playlist.name} hueify test`;
      const playlistId = await createPlaylist(playlistName);
      await populatePlaylist(playlistId, sortedTrackUris);
    } catch (err) {
      console.error('Error saving playlist:', err);
      setError('Failed to save playlist');
    }
  };

  // Extract artwork URL with error handling
  const getArtworkUrl = useCallback(
    (track: TrackObject | EpisodeObject, index: number = 1): string => {
      if (index < 0 || index > 2) {
        console.warn('Artwork index out of range, using fallback');
        return FALLBACK_IMAGE;
      }

      const images = 'album' in track ? track.album?.images : track.images;
      if (!images?.length) return FALLBACK_IMAGE;

      // Prefer medium resolution (index 1) for balance of quality and performance
      return images[index]?.url || images[2]?.url || images[0]?.url || FALLBACK_IMAGE;
    },
    []
  );

  // Color utility functions
  const isColorViable = useCallback((rgb: [number, number, number]): boolean => {
    try {
      const hsl = chroma(rgb).hsl();
      const [h, s, l] = hsl;

      // Filter out colors that are too unsaturated, too dark, or too light
      return (
        !isNaN(s) &&
        s >= MIN_SATURATION_THRESHOLD &&
        !isNaN(l) &&
        l >= MIN_LIGHTNESS_THRESHOLD &&
        l <= MAX_LIGHTNESS_THRESHOLD
      );
    } catch {
      return false;
    }
  }, []);

  const getColorVibrancy = useCallback((rgb: [number, number, number]): number => {
    try {
      const hsl = chroma(rgb).hsl();
      const [h, s, l] = hsl;

      // Score based on saturation and balanced lightness
      // Prefer colors that aren't too dark or too light
      const lightnessScore = 1 - Math.abs(l - 0.5) * 2; // Peak at 0.5 lightness
      const saturationScore = s || 0;

      return saturationScore * 0.7 + lightnessScore * 0.3;
    } catch {
      return 0;
    }
  }, []);

  const selectBestColor = useCallback(
    (palette: [number, number, number][]): [number, number, number] => {
      if (!palette.length) return FALLBACK_COLOR;

      // Filter viable colors and score them
      const scoredColors = palette
        .map((color, index) => ({
          color,
          dominanceWeight: 1 / (index + 1), // First color gets highest dominance
          vibrancyScore: getColorVibrancy(color),
          isViable: isColorViable(color),
        }))
        .filter((item) => item.isViable)
        .map((item) => ({
          ...item,
          totalScore: item.dominanceWeight * 0.4 + item.vibrancyScore * 0.6,
        }))
        .sort((a, b) => b.totalScore - a.totalScore);

      // Return the best scored color, or fall back to the most dominant if none are viable
      return scoredColors[0]?.color || palette[0];
    },
    [isColorViable, getColorVibrancy]
  );

  // Convert RGB to LCH with better error handling
  const getLCH = useCallback((rgb: [number, number, number]): [number, number, number] => {
    try {
      const lch = chroma(rgb).lch();
      // Handle NaN values that can occur with grayscale colors
      return [
        isNaN(lch[0]) ? 50 : lch[0], // L: 50 for neutral gray
        isNaN(lch[1]) ? 0 : lch[1], // C: 0 for no chroma
        isNaN(lch[2]) ? 0 : lch[2], // H: 0 for neutral hue
      ] as [number, number, number];
    } catch {
      return [50, 0, 0]; // Neutral gray fallback
    }
  }, []);

  // Process a single track's color data with improved error handling
  const processTrackColor = useCallback(
    async (track: TrackObject | EpisodeObject, thief: ColorThief): Promise<ProcessedTrack> => {
      const artworkUrl = getArtworkUrl(track);

      try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        const { bestColor, palette } = await new Promise<{
          bestColor: [number, number, number];
          palette: [number, number, number][];
        }>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Image load timeout'));
          }, IMAGE_LOAD_TIMEOUT);

          img.onload = () => {
            clearTimeout(timeout);
            try {
              // Get a larger palette for better selection
              const fullPalette = thief.getPalette(img, PALETTE_SIZE, 1) as [
                number,
                number,
                number,
              ][];
              const dominantColor = thief.getColor(img, 1) as [number, number, number];

              // Ensure we have a palette
              const palette = fullPalette?.length ? fullPalette : [dominantColor];

              // Select the best representative color
              const bestColor = selectBestColor(palette);

              resolve({ bestColor, palette });
            } catch (colorError) {
              console.warn(`ColorThief failed for ${track.name}:`, colorError);
              resolve({
                bestColor: FALLBACK_COLOR,
                palette: [FALLBACK_COLOR],
              });
            }
          };

          img.onerror = (event) => {
            clearTimeout(timeout);
            console.warn(`Failed to load image for ${track.name}:`, artworkUrl, event);
            resolve({
              bestColor: FALLBACK_COLOR,
              palette: [FALLBACK_COLOR],
            });
          };

          img.src = artworkUrl;
        });

        const lch = getLCH(bestColor);

        return {
          track,
          dominantColor: bestColor,
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
    },
    [getArtworkUrl, selectBestColor, getLCH]
  );

  // Process tracks in batches with better progress tracking
  const processTracksInBatches = useCallback(
    async (tracks: (TrackObject | EpisodeObject)[]) => {
      const thief = new ColorThief();
      const results: ProcessedTrack[] = [];

      for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
        const batch = tracks.slice(i, i + BATCH_SIZE);

        try {
          const batchResults = await Promise.all(
            batch.map((track) => processTrackColor(track, thief))
          );

          results.push(...batchResults);
          setProgress(results.length);

          // Update state after each batch for progressive loading
          setProcessedTracks([...results]);
        } catch (batchError) {
          console.error(`Error processing batch ${i / BATCH_SIZE + 1}:`, batchError);
          // Continue with next batch even if current batch fails
        }
      }

      return results;
    },
    [processTrackColor]
  );

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

      // Tertiary sort: Lightness - lighter first within same hue/chroma
      return lB - lA;
    });
  }, [processedTracks]);

  // Process tracks with better error handling
  useEffect(() => {
    const processColors = async () => {
      try {
        setError(null);
        const tracks = await getPlaylistTracks(playlist.id);

        if (tracks.length === 0) {
          setIsLoading(false);
          return;
        }

        setTotalTracks(tracks.length);
        console.log(`Processing colors for ${tracks.length} tracks...`);

        await processTracksInBatches(tracks);
        console.log('Color processing complete!');
      } catch (error) {
        console.error('Error processing playlist colors:', error);
        setError('Failed to process playlist colors');
      } finally {
        setIsLoading(false);
      }
    };

    processColors();
  }, [playlist.id, processTracksInBatches]);

  // Extract URIs with better type safety
  const sortedTrackUris = useMemo(
    () =>
      sortedTracks
        .map((item) => {
          if ('uri' in item.track && typeof item.track.uri === 'string') {
            return item.track.uri;
          }
          return null;
        })
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
          disabled={isLoading || sortedTracks.length === 0}
          className="btn hover:bg-black-active active:bg-black-active cursor-pointer rounded-lg bg-black px-4 py-2 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
        >
          Save playlist to Spotify
        </button>

        {error && (
          <div className="rounded-lg bg-red-100 px-4 py-2 text-red-700 dark:bg-red-900 dark:text-red-300">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <div>Processing colors...</div>
            <div className="text-sm">
              {progress} / {totalTracks} tracks
            </div>
            <div className="h-4 w-64 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-black transition-all duration-300 dark:bg-white"
                style={{
                  width: `${totalTracks > 0 ? (progress / totalTracks) * 100 : 0}%`,
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
                className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 p-2 transition-all duration-200 hover:bg-gray-200 hover:shadow-md dark:bg-gray-800 dark:hover:bg-gray-700"
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
                    loading="lazy"
                  />
                </div>

                {/* Dominant Color */}
                <div
                  className="h-6 w-6 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                />

                {/* Color Palette */}
                <div className="grid grid-cols-5 gap-0.5">
                  {item.colorPalette.slice(0, 5).map((color, colorIndex) => (
                    <div
                      key={colorIndex}
                      className="h-3 w-3 rounded-full border border-gray-300"
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
      className="hover:bg-white-active active:bg-white-active fixed top-16 left-4 z-10 cursor-pointer rounded-lg p-2 transition-colors duration-300 md:top-20 md:left-20"
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
