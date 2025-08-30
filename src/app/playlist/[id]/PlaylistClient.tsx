'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import ColorThief from 'colorthief';

type PlaylistClientProps = {
  playlist: any;
  tracks: any[];
};

export default function PlaylistClient({ playlist, tracks }: PlaylistClientProps) {
  const [sortedTracks, setSortedTracks] = useState<any[]>([]);

  // Filter unique albums (first occurrence only)
  const seenAlbums = new Set<string>();
  const uniqueTracks = tracks.filter((track) => {
    const albumId = track.track?.album?.id;
    if (!albumId) return false;
    if (seenAlbums.has(albumId)) return false;
    seenAlbums.add(albumId);
    return true;
  });

  useEffect(() => {
    async function processColors() {
      const thief = new ColorThief();
      const results: { track: any; color: [number, number, number] }[] = [];

      for (const track of uniqueTracks) {
        const src = track.track?.album?.images?.[0]?.url ?? '/spotify/spotify-green.png';

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

  // Determine number of columns
  const numTracks = uniqueTracks.length;
  // let gridColsClass = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6';
  // if (numTracks > 20) gridColsClass = 'grid-cols-3 md:grid-cols-6 lg:grid-cols-8';
  // else if (numTracks > 40) gridColsClass = 'grid-cols-4 md:grid-cols-8 lg:grid-cols-12';
  let gridColsClass = 'grid-cols-1';

  if (!tracks || tracks.length === 0) {
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
        <h1 className="font-corben text-3xl font-bold md:text-4xl">
          {playlist.name}
        </h1>

        <button className="btn bg-foreground text-background px-3 py-2 rounded-full active:bg-black-active hover:bg-black-active duration-300">
          Hueify playlist
        </button>

        <ul className={`absolute opacity-100 -z-10 top-0 grid w-full gap-4 px-164 ${gridColsClass}`}>
          {sortedTracks.map((track) => {
            const src = track.track?.album?.images?.[0]?.url ?? '/spotify/spotify-green.png';
            const title = track.track?.name ?? 'Unknown Track';

            return (
              <li
                key={track.track?.id}
                className="group relative aspect-square w-full rounded-lg"
              >
                <NextImage
                  src={src}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
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
