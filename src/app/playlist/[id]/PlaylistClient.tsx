'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import ColorThief from 'colorthief';
import { PlaylistResponse, TrackObject, EpisodeObject } from '@/types/spotify/playlist';

type PlaylistClientProps = {
  playlist: PlaylistResponse;
};

// Type guard to filter only TrackObjects
function isTrackObject(track: TrackObject | EpisodeObject): track is TrackObject {
  return 'album' in track;
}

export default function PlaylistClient({ playlist }: PlaylistClientProps) {
  const [sortedTracks, setSortedTracks] = useState<TrackObject[]>([]);

  // Filter only TrackObjects and unique albums
  const trackItems: TrackObject[] = playlist.tracks.items
    .map((item) => item.track)
    .filter(isTrackObject);

  const seenAlbums = new Set<string>();
  const uniqueTracks = trackItems.filter((track) => {
    if (!track.album.id) return false;
    if (seenAlbums.has(track.album.id)) return false;
    seenAlbums.add(track.album.id);
    return true;
  });

  useEffect(() => {
    async function processColors() {
      const thief = new ColorThief();
      const results: { track: TrackObject; color: [number, number, number] }[] = [];

      for (const track of uniqueTracks) {
        const src = track.album.images?.[0]?.url ?? '/spotify/spotify-green.png';

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = src;

        await new Promise<void>((resolve) => {
          img.onload = () => {
            try {
              const color = thief.getColor(img) as [number, number, number];
              results.push({ track, color });
            } catch {
              results.push({ track, color: [0, 0, 0] });
            }
            resolve();
          };
          img.onerror = () => {
            results.push({ track, color: [0, 0, 0] });
            resolve();
          };
        });
      }

      function rgbToHue([r, g, b]: [number, number, number]) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        if (max === min) h = 0;
        else if (max === r) h = ((60 * (g - b)) / (max - min) + 360) % 360;
        else if (max === g) h = (60 * (b - r)) / (max - min) + 120;
        else h = (60 * (r - g)) / (max - min) + 240;
        return h;
      }

      results.sort((a, b) => rgbToHue(a.color) - rgbToHue(b.color));
      setSortedTracks(results.map((r) => r.track));
    }

    processColors();
  }, [uniqueTracks]);

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

        <button className="btn bg-foreground text-background active:bg-black-active hover:bg-black-active rounded-full px-3 py-2 duration-300">
          Hueify playlist
        </button>

        <ul className="scrollbar-thin scrollbar-thumb-gray-400 flex max-h-[70vh] w-full flex-col gap-4 overflow-y-auto px-4 pb-4">
          {sortedTracks.map((track) => {
            const src = track.album.images?.[0]?.url ?? '/spotify/spotify-green.png';
            const title = track.name ?? 'Unknown Track';

            return (
              <li
                key={track.id}
                className="relative mx-auto aspect-square w-full max-w-[300px] rounded-lg"
              >
                <NextImage
                  src={src}
                  alt={title}
                  fill
                  sizes="300px"
                  className="rounded-lg object-cover"
                />
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
