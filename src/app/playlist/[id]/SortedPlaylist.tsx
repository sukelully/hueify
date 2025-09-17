'use client';

import { useState, useMemo } from 'react';
import NextImage from 'next/image';
import { PlaylistResponse } from '@/types/spotify/playlist';
import { useRouter } from 'next/navigation';
import { createPlaylist, populatePlaylist } from '@/lib/actions';
import LoadingScreen from '@/components/LoadingScreen';
import { useProcessedTracks } from '@/hooks/useProcessedTracks';

type SortedPlaylistProps = {
  playlist: PlaylistResponse;
};

export default function SortedPlaylist({ playlist }: SortedPlaylistProps) {
  const { processedTracks, isLoading, getArtworkUrl, getLCH } = useProcessedTracks(playlist.id);
  const [manualColors, setManualColors] = useState<Record<string, [number, number, number]>>({});
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const router = useRouter();

  const savePlaylist = async () => {
    try {
      const playlistName = `${playlist.name} hueify test`;
      const playlistId = await createPlaylist(playlistName);
      await populatePlaylist(playlistId, sortedTrackUris);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save playlist:', error);
    }
  };

  // Sort tracks by LCH hue
  const sortedTracks = useMemo(() => {
    return [...processedTracks].sort((a, b) => {
      const artworkA = getArtworkUrl(a.track, 1);
      const artworkB = getArtworkUrl(b.track, 1);

      const colorA = manualColors[artworkA] || a.bestColor;
      const colorB = manualColors[artworkB] || b.bestColor;

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
        <h1 className="font-corben mb-2 truncate px-8 text-center text-xl font-bold md:text-3xl">
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

        <div className="flex justify-center py-6 md:mb-8">
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

          const artwork = getArtworkUrl(track.track, 1);
          const currentColor = manualColors[artwork] || track.bestColor;

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
                          setManualColors((prev) => ({ ...prev, [artwork]: color }));
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
