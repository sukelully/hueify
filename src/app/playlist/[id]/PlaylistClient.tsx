'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import ColorThief from 'colorthief';
import { PlaylistResponse, TrackObject, EpisodeObject } from '@/types/spotify/playlist';

type PlaylistClientProps = {
  playlist: PlaylistResponse;
};

type SortedTracks = {
  track: TrackObject;
  color: [number, number, number];
};

// Type guard to filter only TrackObjects
function isTrackObject(track: TrackObject | EpisodeObject): track is TrackObject {
  return 'album' in track;
}

export default function PlaylistClient({ playlist }: PlaylistClientProps) {
  // const [sortedTracks, setSortedTracks] = useState<TrackObject[]>([]);
  const [sortedTracks, setSortedTracks] = useState<SortedTracks[]>([]);

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
        const src = track.album.images?.at(-2)?.url ?? '/spotify/spotify-green.png';

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

      function rgbToHue([r, g, b]: [number, number, number]): number {
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

      function rgb2hsv([r, g, b]: [number, number, number]) {
        let rr, gg, bb, h, s: number;
        const rabs = r / 255;
        const gabs = g / 255;
        const babs = b / 255;
        const v = Math.max(rabs, gabs, babs);
        const diff = v - Math.min(rabs, gabs, babs);

        const diffc: (c: number) => number = (c) => (v - c) / 6 / diff + 1 / 2;
        const percentRoundFn: (num: number) => number = (num) => Math.round(num * 100) / 100;

        if (diff === 0) {
          h = s = 0;
        } else {
          s = diff / v;
          rr = diffc(rabs);
          gg = diffc(gabs);
          bb = diffc(babs);

          if (rabs === v) {
            h = bb - gg;
          } else if (gabs === v) {
            h = 1 / 3 + rr - bb;
          } else if (babs === v) {
            h = 2 / 3 + gg - rr;
          }
          if (!h) return { h: 0, s: 0, v: 0 };
          if (h < 0) {
            h += 1;
          } else if (h > 1) {
            h -= 1;
          }
        }
        return {
          h: Math.round(h * 360),
          s: percentRoundFn(s * 100),
          v: percentRoundFn(v * 100),
        };
      }

      function stepSort([r, g, b]: [number, number, number], repetitions: number = 1): number {
        const lum = rgbToLum([r, g, b]);

        const { h, s, v } = rgb2hsv([r, g, b]);
        const h2 = Math.floor(h * repetitions);
        const lum2 = Math.floor(lum * repetitions);
        let v2 = Math.floor(v * repetitions);

        let adjustedLum = lum2;
        if (h2 % 2 === 1) {
          v2 = repetitions - v2;
          adjustedLum = repetitions - lum2;
        }

        // Combine into a single number for sorting
        return h2 * 10000 + adjustedLum * 100 + v2;
      }

      function rgbToLum([r, g, b]: [number, number, number]): number {
        return Math.sqrt(0.241 * r + 0.691 * g + 0.068 * b); // note the 0.068 on B
      }

      // results.sort((a, b) => rgbToLum(a.color) - rgbToLum(b.color));
      results.sort((a, b) => rgbToHue(a.color) - rgbToHue(b.color));
      // results.sort((a, b) => stepSort(a.color, 8) - stepSort(b.color, 8));
      setSortedTracks(results.map((r) => ({ track: r.track, color: r.color })));
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

        <ul className="scrollbar-thin scrollbar-thumb-gray-400 flex flex-col gap-4 overflow-y-auto px-4 pb-4">
          {sortedTracks.map((track) => {
            const src = track.track.album.images?.[1]?.url ?? '/spotify/spotify-green.png';
            const title = track.track.name ?? 'Unknown Track';
            const [r, g, b] = track.color;

            return (
              <li
                key={track.track.id}
                className="flex flex-col items-center gap-4 rounded-lg bg-gray-100 p-2"
              >
                {/* Album Cover */}
                <div className="relative h-32 w-32">
                  <NextImage
                    src={src}
                    alt={title}
                    fill
                    sizes="64px"
                    className="rounded-lg object-cover"
                  />
                </div>

                {/* RGB Color Div */}
                <div
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                  title={`RGB(${r}, ${g}, ${b})`}
                ></div>
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
