import { useState, useEffect } from 'react';
import ColorThief from 'colorthief';
import chroma from 'chroma-js';
import { TrackObject, EpisodeObject } from '@/types/spotify/playlist';
import { getPlaylistTracks } from '@/lib/actions';

type ProcessedTrack = {
  track: TrackObject | EpisodeObject;
  bestColor: [number, number, number];
  dominantColor: [number, number, number];
  colorPalette: [number, number, number][];
  lch: [number, number, number];
};

export function useProcessedTracks(playlistId: string) {
  const [processedTracks, setProcessedTracks] = useState<ProcessedTrack[]>([]);
  const [progress, setProgress] = useState(0);
  const [totalTracks, setTotalTracks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Convert RGB to LCH color format
  const getLCH = (rgb: [number, number, number]): [number, number, number] => {
    try {
      return chroma(rgb).lch() as [number, number, number];
    } catch {
      console.warn('Could not convert to LCH format');
      return [50, 0, 0];
    }
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

  useEffect(() => {
    const processColors = async () => {
      setIsLoading(true);
      const tracks = await getPlaylistTracks(playlistId);
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
  }, [playlistId]);

  return { processedTracks, isLoading, progress, totalTracks, getArtworkUrl, getLCH };
}
