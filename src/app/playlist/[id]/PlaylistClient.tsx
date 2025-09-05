'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import ColorThief from 'colorthief';
import { PlaylistResponse, TrackObject, EpisodeObject } from '@/types/spotify/playlist';
import chroma from 'chroma-js';

type PlaylistClientProps = {
  playlist: PlaylistResponse;
};

type SortedTracks = {
  track: TrackObject;
  color: [number, number, number];
  dominantColor: [number, number, number]; // Store the most dominant color
  colorPalette: [number, number, number][]; // Store full palette for better analysis
};

// Type guard to filter only TrackObjects
function isTrackObject(track: TrackObject | EpisodeObject): track is TrackObject {
  return 'album' in track;
}

export default function PlaylistClient({ playlist }: PlaylistClientProps) {
  const [sortedTracks, setSortedTracks] = useState<SortedTracks[]>([]);
  const [sortMethod, setSortMethod] = useState<
    'hue' | 'hue-vivid' | 'lum' | 'step' | 'lch' | 'perceptual'
  >('perceptual');

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
      const results: SortedTracks[] = [];

      for (const track of uniqueTracks) {
        const src = track.album.images?.at(-2)?.url ?? '/spotify/spotify-green.png';
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = src;

        await new Promise<void>((resolve) => {
          img.onload = () => {
            try {
              // Get both dominant color and palette
              const dominantColor = thief.getColor(img) as [number, number, number];
              const palette = thief.getPalette(img) as [number, number, number][];

              // Choose the best representative color
              const bestColor = chooseBestColor(dominantColor, palette);

              results.push({
                track,
                color: bestColor,
                dominantColor,
                colorPalette: palette || [dominantColor],
              });
            } catch {
              const fallback: [number, number, number] = [128, 128, 128];
              results.push({
                track,
                color: fallback,
                dominantColor: fallback,
                colorPalette: [fallback],
              });
            }
            resolve();
          };
          img.onerror = () => {
            const fallback: [number, number, number] = [128, 128, 128];
            results.push({
              track,
              color: fallback,
              dominantColor: fallback,
              colorPalette: [fallback],
            });
            resolve();
          };
        });
      }

      // Enhanced sorting functions
      function chooseBestColor(
        dominant: [number, number, number],
        palette: [number, number, number][]
      ): [number, number, number] {
        if (!palette || palette.length === 0) return dominant;

        // Filter out very dark, very light, or very gray colors
        const filtered = palette.filter(([r, g, b]) => {
          const brightness = (r + g + b) / 3;
          const saturation = getSaturation([r, g, b]);

          return brightness > 30 && brightness < 240 && saturation > 0.1;
        });

        if (filtered.length === 0) return dominant;

        // Choose the most saturated color from filtered options
        return filtered.reduce((best, current) =>
          getSaturation(current) > getSaturation(best) ? current : best
        );
      }

      function getSaturation([r, g, b]: [number, number, number]): number {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        return max === 0 ? 0 : (max - min) / max;
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

      function rgbToLCH([r, g, b]: [number, number, number]) {
        try {
          return chroma(r, g, b).lch();
        } catch {
          return [50, 0, 0]; // Fallback for invalid colors
        }
      }

      function rgbToLum([r, g, b]: [number, number, number]): number {
        // Perceptual luminance formula
        const [rs, gs, bs] = [r, g, b].map((c) => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }

      function stepSort([r, g, b]: [number, number, number], repetitions: number = 8): number {
        const lum = rgbToLum([r, g, b]);
        const h = rgbToHue([r, g, b]);
        const h2 = Math.floor((h * repetitions) / 360);
        const lum2 = Math.floor(lum * repetitions);
        return h2 * 1000 + lum2;
      }

      function checkVividness([r, g, b]: [number, number, number]): number {
        if (r === g && g === b) return 0;
        return Math.sqrt(r * r + g * g + b * b - r * g - r * b - g * b);
      }

      // New perceptual sorting method
      function perceptualSort(a: SortedTracks, b: SortedTracks): number {
        const [L1, C1, H1] = rgbToLCH(a.color);
        const [L2, C2, H2] = rgbToLCH(b.color);

        // Handle achromatic colors (grays) separately
        const isGray1 = C1 < 10;
        const isGray2 = C2 < 10;

        if (isGray1 && isGray2) {
          return L1 - L2; // Sort grays by lightness
        }
        if (isGray1) return 1; // Grays go last
        if (isGray2) return -1;

        // For chromatic colors, use a weighted hue-chroma-lightness sort
        let hueDiff = Math.abs(H1 - H2);
        if (hueDiff > 180) hueDiff = 360 - hueDiff;

        // Primary sort by hue (with smooth transitions)
        if (hueDiff > 15) {
          // Normalize hue for circular sorting (red at both 0 and 360)
          let h1Norm = H1;
          let h2Norm = H2;
          if (Math.abs(h1Norm - h2Norm) > 180) {
            if (h1Norm > h2Norm) h2Norm += 360;
            else h1Norm += 360;
          }
          return h1Norm - h2Norm;
        }

        // Secondary sort by chroma (more vivid first within same hue)
        if (Math.abs(C1 - C2) > 5) {
          return C2 - C1;
        }

        // Tertiary sort by lightness
        return L1 - L2;
      }

      // Apply selected sort
      results.sort((a, b) => {
        if (sortMethod === 'hue') return rgbToHue(a.color) - rgbToHue(b.color);
        if (sortMethod === 'hue-vivid') {
          const hv = rgbToHue(a.color) - rgbToHue(b.color);
          if (Math.abs(hv) < 10) {
            return checkVividness(b.color) - checkVividness(a.color);
          }
          return hv;
        }
        if (sortMethod === 'lum') return rgbToLum(a.color) - rgbToLum(b.color);
        if (sortMethod === 'step') return stepSort(a.color) - stepSort(b.color);
        if (sortMethod === 'lch') {
          const [L1, C1, H1] = rgbToLCH(a.color);
          const [L2, C2, H2] = rgbToLCH(b.color);

          if (Math.abs(H1 - H2) > 5) return H1 - H2;
          if (Math.abs(C1 - C2) > 5) return C2 - C1;
          return L1 - L2;
        }
        if (sortMethod === 'perceptual') return perceptualSort(a, b);
        return 0;
      });

      setSortedTracks(results);
    }

    processColors();
  }, [uniqueTracks, sortMethod]);

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

        {/* Enhanced Sort Dropdown */}
        <div className="flex flex-col items-center gap-2">
          <select
            className="btn bg-foreground text-background rounded-full px-4 py-2 text-center"
            value={sortMethod}
            onChange={(e) => setSortMethod(e.target.value as typeof sortMethod)}
          >
            <option value="perceptual">Perceptual (Recommended)</option>
            <option value="hue">Hue</option>
            <option value="hue-vivid">Hue Vivid</option>
            <option value="lum">Luminosity</option>
            <option value="step">Step Sort</option>
            <option value="lch">LCH</option>
          </select>
          <p className="max-w-md text-center text-sm text-gray-600">
            {sortMethod === 'perceptual' &&
              'Smart sorting that handles grays and similar colors better'}
            {sortMethod === 'hue' && 'Basic hue-based sorting'}
            {sortMethod === 'hue-vivid' && 'Hue sorting with vividness tiebreaker'}
            {sortMethod === 'lum' && 'Sort by brightness/luminosity'}
            {sortMethod === 'step' && 'Stepped hue-luminosity sorting'}
            {sortMethod === 'lch' && 'Perceptual color space sorting'}
          </p>
        </div>

        <ul className="scrollbar-thin scrollbar-thumb-gray-400 grid grid-cols-4 gap-4 overflow-y-auto px-4 pb-4 md:grid-cols-6">
          {sortedTracks.map((item, index) => {
            const src = item.track.album.images?.[1]?.url ?? '/spotify/spotify-green.png';
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
                  />
                </div>

                {/* Color Information */}
                {/* <div className="flex flex-col items-center gap-1">
                  <div
                    className="h-6 w-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                  ></div>
                  <span className="text-xs text-gray-600 text-center leading-tight">
                    {title.length > 15 ? title.slice(0, 15) + '...' : title}
                  </span>
                </div> */}
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
