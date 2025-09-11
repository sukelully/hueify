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
  bestColor: [number, number, number];
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

export default function SortedPlaylist({ playlist }: SortedPlaylistProps) {
  const [processedTracks, setProcessedTracks] = useState<ProcessedTrack[]>([]);
  const [manualColors, setManualColors] = useState<Record<string, [number, number, number]>>({});
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [totalTracks, setTotalTracks] = useState(0);

  // Save playlist
  const savePlaylist = async () => {
    const playlistName = `${playlist.name} hueify test`;
    const playlistId = await createPlaylist(playlistName);
    await populatePlaylist(playlistId, sortedTrackUris);
  };

  // Best color selection
  const selectBestColor = (
    dominant: [number, number, number],
    palette: [number, number, number][]
  ): [number, number, number] => {
    const getLCH = (rgb: [number, number, number]) => chroma(rgb).lch() as [number, number, number];
    const [L, C] = getLCH(dominant);
    const tooDark = L < 15;
    const tooLight = L > 85;
    const tooDull = C < 15;

    if (!tooDark && !tooLight && !tooDull) return dominant;

    const scored = palette.map((color) => {
      const [l, c] = getLCH(color);
      const distanceFromMid = Math.abs(l - 50);
      const score = c * 2 - distanceFromMid;
      return { color, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.length > 0 ? scored[0].color : dominant;
  };

  const getArtworkUrl = (track: TrackObject | EpisodeObject, index: number = 1): string => {
    if (index < 0 || index > 2) throw new Error('Artwork index out of range');
    const images = 'album' in track ? track.album?.images : track.images;
    if (!images?.length) return FALLBACK_IMAGE;
    return images[index]?.url || images[2]?.url || FALLBACK_IMAGE;
  };

  const getLCH = (rgb: [number, number, number]): [number, number, number] => {
    try {
      return chroma(rgb).lch() as [number, number, number];
    } catch {
      return [50, 0, 0];
    }
  };

  const processTrackColor = async (track: TrackObject | EpisodeObject, thief: ColorThief) => {
    const artworkUrl = getArtworkUrl(track);
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

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
            const dominantColor = thief.getColor(img, 2) as [number, number, number];
            const palette = (thief.getPalette(img) as [number, number, number][]) || [
              dominantColor,
            ];
            resolve({ dominantColor, palette });
          } catch {
            resolve({ dominantColor: FALLBACK_COLOR, palette: [FALLBACK_COLOR] });
          }
        };

        img.onerror = () => {
          clearTimeout(timeout);
          resolve({ dominantColor: FALLBACK_COLOR, palette: [FALLBACK_COLOR] });
        };

        img.src = artworkUrl;
      });

      const bestColor = selectBestColor(dominantColor, palette);
      const lch = getLCH(bestColor);

      return { track, bestColor, dominantColor, colorPalette: palette, lch };
    } catch {
      return {
        track,
        bestColor: FALLBACK_COLOR,
        dominantColor: FALLBACK_COLOR,
        colorPalette: [FALLBACK_COLOR],
        lch: getLCH(FALLBACK_COLOR),
      };
    }
  };

  const processTracksInBatches = async (tracks: (TrackObject | EpisodeObject)[]) => {
    const thief = new ColorThief();
    const results: ProcessedTrack[] = [];

    for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
      const batch = tracks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map((track) => processTrackColor(track, thief)));
      results.push(...batchResults);
      setProgress(results.length);
      setProcessedTracks([...results]);
    }
    return results;
  };

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

  return (
    <div className="relative min-h-screen p-4">
      <DashboardChevron />

      <div className="flex flex-col items-center gap-6 pt-24 md:pt-28">
        <h1 className="font-corben text-center text-3xl font-bold md:text-4xl">{playlist.name}</h1>
        <p className="text-secondary-text text-center">
          Click on a track to select a different color option.
        </p>

        <div className="flex gap-4">
          <button
            onClick={savePlaylist}
            className="btn hover:bg-black-active rounded-lg bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          >
            Save playlist to Spotify
          </button>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <div>Processing colors...</div>
            <div className="text-sm">
              {progress} / {totalTracks} tracks
            </div>
            <div className="flex h-4 w-full justify-start rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-black transition-all duration-300 dark:bg-white"
                style={{ width: `${(progress / totalTracks) * 100}%` }}
              />
            </div>
          </div>
        )}

        <ul className="scrollbar-thin scrollbar-thumb-gray-400 grid grid-cols-3 gap-4 overflow-y-auto px-4 pb-4 md:grid-cols-4">
          {sortedTracks.map((item, index) => {
            const src = getArtworkUrl(item.track, 1);
            const title = item.track.name || 'Unknown Track';

            return (
              <li
                key={`${item.track.id}-${index}`}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200"
                onClick={() => setActiveTrackId(item.track.id)}
              >
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
              </li>
            );
          })}
        </ul>

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
                    className="mt-4 rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
                    onClick={() => setActiveTrackId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          })()}
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
