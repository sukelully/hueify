'use client';

import { useState, useEffect, useMemo } from 'react';
import NextImage from 'next/image';
import ColorThief from 'colorthief';
import { PlaylistResponse, TrackObject, EpisodeObject } from '@/types/spotify/playlist';
import chroma from 'chroma-js';
import { createPlaylist, populatePlaylist, getPlaylistTracks } from '@/lib/actions';
import LoadingScreen from '@/components/LoadingScreen';

type ProcessedTrack = {
  track: TrackObject | EpisodeObject;
  bestColor: [number, number, number];
  dominantColor: [number, number, number];
  colorPalette: [number, number, number][];
  lch: [number, number, number];
};

type SortedPlaylistProps = {
  playlist: PlaylistResponse;
};

export default function SortedPlaylist({ playlist }: SortedPlaylistProps) {
  const [processedTracks, setProcessedTracks] = useState<ProcessedTrack[]>([]);
  const [manualColors, setManualColors] = useState<Record<string, [number, number, number]>>({});
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [totalTracks, setTotalTracks] = useState(0);

  // Save playlist, RUDIMENTARY
  const savePlaylist = async () => {
    const playlistName = `${playlist.name} hueify test`;
    const playlistId = await createPlaylist(playlistName);
    await populatePlaylist(playlistId, sortedTrackUris);
  };

  // Attempt to select best color, RGB input
  const selectBestColor = (
    dominant: [number, number, number],
    palette: [number, number, number][]
  ): [number, number, number] => {
    const [L, C] = getLCH(dominant);
    const tooDark = L < 10;
    const tooLight = L > 90;
    const tooDull = C < 10;

    // Use dominant if (potentially) suitable
    if (!tooDark && !tooLight && !tooDull) return dominant;

    // Use the next most vivid, moderately bright color
    const scored = palette.map((color) => {
      const [l, c] = getLCH(color);
      const distanceFromMid = Math.abs(l - 50);
      const score = c * 2 - distanceFromMid;

      return { color, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.length > 0 ? scored[0].color : dominant;
  };

  // Get artwork src for track and episode objects
  const getArtworkUrl = (track: TrackObject | EpisodeObject, index: number = 1): string => {
    const FALLBACK_IMAGE = '/spotify/spotify-green.png';

    if (index < 0 || index > 2) throw new Error('Artwork index out of range');

    const images = 'album' in track ? track.album?.images : track.images;
    if (!images?.length) return FALLBACK_IMAGE;

    return images[index]?.url || images[2]?.url || FALLBACK_IMAGE;
  };

  // Convert RGB to LCH color format
  const getLCH = (rgb: [number, number, number]): [number, number, number] => {
    try {
      return chroma(rgb).lch() as [number, number, number];
    } catch {
      console.warn('Could not convert to LCH format');
      return [50, 0, 0];
    }
  };

  // Extract dominant color and palette from track cover art
  const extractTrackColor = async (track: TrackObject | EpisodeObject, thief: ColorThief) => {
    const IMAGE_LOAD_TIMEOUT = 8000;
    const FALLBACK_COLOR: [number, number, number] = [128, 128, 128];
    const artworkUrl = getArtworkUrl(track);

    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      // Load image with timeout
      const { dominantColor, palette } = await new Promise<{
        dominantColor: [number, number, number];
        palette: [number, number, number][];
      }>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error('Image load timeout')),
          IMAGE_LOAD_TIMEOUT
        );

        img.onload = () => {
          clearTimeout(timeout);
          try {
            // Extract colors
            const dominantColor = thief.getColor(img, 2) as [number, number, number];
            const palette = (thief.getPalette(img) as [number, number, number][]) || [
              dominantColor,
            ];
            resolve({ dominantColor, palette });
          } catch {
            console.warn(`ColorThief failed for ${track.name}, fallback used`);
            resolve({ dominantColor: FALLBACK_COLOR, palette: [FALLBACK_COLOR] });
          }
        };

        img.onerror = () => {
          clearTimeout(timeout);
          console.warn(`ColorThief failed for ${track.name}, fallback used`);
          resolve({ dominantColor: FALLBACK_COLOR, palette: [FALLBACK_COLOR] });
        };

        img.src = artworkUrl;
      });

      const bestColor = selectBestColor(dominantColor, palette);
      const lch = getLCH(bestColor);

      return { track, bestColor, dominantColor, colorPalette: palette, lch };
    } catch {
      console.error(`Image load timeout or unexpected error for ${track.name}, fallback used`);
      return {
        track,
        bestColor: FALLBACK_COLOR,
        dominantColor: FALLBACK_COLOR,
        colorPalette: [FALLBACK_COLOR],
        lch: getLCH(FALLBACK_COLOR),
      };
    }
  };

  // Extract color from tracks in a batch
  const processTracksInBatches = async (tracks: (TrackObject | EpisodeObject)[]) => {
    const BATCH_SIZE = 5;
    const thief = new ColorThief();
    const results: ProcessedTrack[] = [];

    for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
      const batch = tracks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map((track) => extractTrackColor(track, thief)));
      results.push(...batchResults);
      setProgress(results.length);
      setProcessedTracks([...results]);
    }
    return results;
  };

  // Process (extract colors) tracks
  useEffect(() => {
    const processColors = async () => {
      const tracks = await getPlaylistTracks(playlist.id);
      setTotalTracks(tracks.length);
      if (tracks.length === 0) {
        setIsLoading(false);
        return;
      }
      try {
        await processTracksInBatches(tracks);
      } catch {
        console.error('Error processing playlist colors');
      } finally {
        setIsLoading(false);
      }
    };

    processColors();
  }, [playlist.id]);

  // Sort tracks by LCH hue
  const sortedTracks = useMemo(() => {
    return [...processedTracks].sort((a, b) => {
      const colorA = manualColors[a.track.id] || a.bestColor;
      const colorB = manualColors[b.track.id] || b.bestColor;
      const [lA, cA, hA] = getLCH(colorA);
      const [lB, cB, hB] = getLCH(colorB);

      const hueA = isNaN(hA) || cA < 5 ? 360 : hA;
      const hueB = isNaN(hB) || cB < 5 ? 360 : hB;

      if (Math.abs(hueA - hueB) > 15) return hueA - hueB;
      if (Math.abs(cA - cB) > 10) return cB - cA;
      return lB - lA;
    });
  }, [processedTracks, manualColors]);

  const sortedTrackUris = useMemo(
    () =>
      sortedTracks
        .map((item) => ('uri' in item.track && item.track.uri ? item.track.uri : null))
        .filter((uri): uri is string => uri !== null),
    [sortedTracks]
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div className="flex h-full w-full max-w-4xl flex-col">
        <h1 className="font-corben mb-2 px-4 text-center text-xl font-bold md:text-3xl">
          {playlist.name}
        </h1>
        <p className="text-secondary-text mb-2 px-12 text-center text-sm md:text-base">
          Track seem out of place? Tap on it to select a better color option.
        </p>
        <ul className="scrollbar-thin scrollbar-thumb-gray-400 grid flex-1 grid-cols-4 gap-2 overflow-y-auto px-4 md:grid-cols-6">
          {sortedTracks.map((item, index) => {
            const src = getArtworkUrl(item.track, 1);
            const title = item.track.name || 'Unknown Track';

            return (
              <li
                key={`${item.track.id}-${index}`}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-lg p-2 transition duration-200 hover:scale-105 hover:bg-gray-200 active:scale-105 active:bg-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-800"
                onClick={() => setActiveTrackId(item.track.id)}
              >
                <div className="relative h-16 w-16 md:h-32 md:w-32">
                  <NextImage
                    src={src}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 96px, 128px"
                    className="rounded-lg object-cover"
                    unoptimized
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-center py-4">
          <button
            onClick={savePlaylist}
            className="btn hover:bg-black-active w-fit rounded-lg bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          >
            Save playlist to Spotify
          </button>
        </div>
      </div>

      {/* Palette Popup */}
      {activeTrackId &&
        (() => {
          const track = processedTracks.find((t) => t.track.id === activeTrackId);
          if (!track) return null;

          const currentColor = manualColors[track.track.id] || track.bestColor;

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              onClick={() => setActiveTrackId(null)}
            >
              <div
                className="flex flex-col justify-center rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="mb-4 text-center text-lg font-bold">{track.track.name}</h2>

                {/* Current Selected Color Display */}
                <div className="mb-4 flex items-center justify-center">
                  <div
                    className="h-12 w-12 rounded-full border border-gray-300"
                    style={{
                      backgroundColor: `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`,
                    }}
                  />
                </div>

                {/* Color Palette */}
                <div className="grid grid-cols-5 gap-2">
                  {track.colorPalette.map((color, idx) => {
                    const isSelected = currentColor.toString() === color.toString();
                    return (
                      <div
                        key={idx}
                        className={`h-6 w-6 rounded-full border ${isSelected ? 'border-black' : 'border-gray-300'} cursor-pointer`}
                        style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
                        onClick={() => {
                          setManualColors((prev) => ({ ...prev, [track.track.id]: color }));
                          setActiveTrackId(null);
                        }}
                      />
                    );
                  })}
                </div>

                <button
                  className="mt-4 cursor-pointer rounded bg-gray-200 px-4 py-2 duration-300 hover:bg-gray-300 active:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:active:bg-gray-500"
                  onClick={() => setActiveTrackId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
