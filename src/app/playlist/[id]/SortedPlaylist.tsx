'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import ColorThief from 'colorthief';
import { PlaylistResponse, TrackObject, EpisodeObject } from '@/types/spotify/playlist';
import chroma from 'chroma-js';

type SortedTracks = {
  track: TrackObject | EpisodeObject;
  color: [number, number, number]; // R, G, B
  dominantColor: [number, number, number];
  colorPalette: [number, number, number][];
};

type SortedPlaylistProps = {
  playlist: PlaylistResponse;
};

export default function SortedPlaylist({ playlist }: SortedPlaylistProps) {
  const [sortedPlaylist, setSortedPlaylist] = useState<SortedTracks[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function processColors() {
      console.log('Starting to process colors for', playlist.tracks.items.length, 'items');
      const thief = new ColorThief();
      const results: SortedTracks[] = [];

      for (const [index, item] of playlist.tracks.items.entries()) {
        const trackOrEpisode = item.track as TrackObject | EpisodeObject;

        // Get artwork URL safely
        const artworkUrl: string = (() => {
          // Pick low resolution image for better performance or spotify fallback
          if ('album' in trackOrEpisode) {
            // Track album art
            return (
              trackOrEpisode.album.images.at(-2)?.url ??
              trackOrEpisode.album.images.at(0)?.url ??
              '/spotify/spotify-green.png'
            );
          } else if ('images' in trackOrEpisode) {
            // Podcast episodes
            return (
              trackOrEpisode.images.at(-2)?.url ??
              trackOrEpisode.images.at(0)?.url ??
              '/spotify/spotify-green.png'
            );
          } else {
            // Fallback
            return '/spotify/spotify-green.png';
          }
        })();

        try {
          const img = new Image();
          img.crossOrigin = 'Anonymous';

          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.log(`Timeout loading image for: ${trackOrEpisode.name}`);
              reject(new Error('Image load timeout'));
            }, 10000); // 10 second timeout

            img.onload = () => {
              clearTimeout(timeout);
              try {
                // Extract colors
                const dominantColor = thief.getColor(img) as [number, number, number];
                const palette = thief.getPalette(img) as [number, number, number][];

                results.push({
                  track: trackOrEpisode,
                  color: dominantColor,
                  dominantColor: dominantColor,
                  colorPalette: palette || [dominantColor],
                });

                console.log(
                  `Processed ${index + 1}/${playlist.tracks.items.length}: ${trackOrEpisode.name} - RGB(${dominantColor.join(', ')})`
                );

                // Update state progressively for better UX
                setSortedPlaylist([...results]);
                resolve();
              } catch (colorError) {
                console.error('ColorThief error for', trackOrEpisode.name, colorError);
                // Fallback color
                const fallback: [number, number, number] = [128, 128, 128];
                results.push({
                  track: trackOrEpisode,
                  color: fallback,
                  dominantColor: fallback,
                  colorPalette: [fallback],
                });
                setSortedPlaylist([...results]);
                resolve();
              }
            };

            img.onerror = () => {
              clearTimeout(timeout);
              console.error('Image failed to load:', artworkUrl);
              // Fallback color
              const fallback: [number, number, number] = [128, 128, 128];
              results.push({
                track: trackOrEpisode,
                color: fallback,
                dominantColor: fallback,
                colorPalette: [fallback],
              });
              setSortedPlaylist([...results]);
              resolve();
            };

            img.src = artworkUrl;
          });
        } catch (error) {
          console.error('Error processing track:', trackOrEpisode.name, error);
          // Add fallback even on error
          const fallback: [number, number, number] = [128, 128, 128];
          results.push({
            track: trackOrEpisode,
            color: fallback,
            dominantColor: fallback,
            colorPalette: [fallback],
          });
        }
      }

      console.log('Finished processing. Total results:', results.length);
      setSortedPlaylist(results);
      setIsLoading(false);
    }

    if (playlist.tracks.items.length > 0) {
      processColors();
    } else {
      setIsLoading(false);
    }
  }, [playlist.tracks.items]);

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

        {isLoading && (
          <div className="text-gray-600">
            Loading colors... ({sortedPlaylist.length}/{playlist.tracks.items.length})
          </div>
        )}

        <ul className="scrollbar-thin scrollbar-thumb-gray-400 grid grid-cols-4 gap-4 overflow-y-auto px-4 pb-4 md:grid-cols-6">
          {sortedPlaylist.map((item, index) => {
            // Handle both tracks and episodes for image source
            let src: string;
            if ('album' in item.track && item.track.album?.images?.[1]?.url) {
              src = item.track.album.images[1].url;
            } else if ('album' in item.track && item.track.album?.images?.[0]?.url) {
              src = item.track.album.images[0].url;
            } else if ('images' in item.track && item.track.images?.[1]?.url) {
              src = item.track.images[1].url;
            } else if ('images' in item.track && item.track.images?.[0]?.url) {
              src = item.track.images[0].url;
            } else {
              src = '/spotify/spotify-green.png';
            }

            const title = item.track.name ?? 'Unknown Track';
            const [r, g, b] = item.color;

            const [L, C, H] = (() => {
              try {
                return chroma(r, g, b).lch();
              } catch {
                return [50, 0, 0]; // Fallback for invalid colors
              }
            })();

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
                    unoptimized // Add this to avoid Next.js optimization issues with external URLs
                  />
                </div>

                {/* Color Information */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="h-6 w-6 rounded-full border border-gray-300 shadow-sm"
                    style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                  ></div>
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
