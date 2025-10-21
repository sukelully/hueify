import chroma from 'chroma-js';
import ColorThief from 'colorthief';
import { TrackObject, EpisodeObject } from '@/types/spotify/playlist';

export type ProcessedTrack = {
  track: TrackObject | EpisodeObject;
  dominantColor: [number, number, number];
  colorPalette: [number, number, number][];
  lch: [number, number, number];
};

// Convert RGB to LCH color format
export const getLCH = (rgb: [number, number, number]): [number, number, number] => {
  try {
    return chroma(rgb).lch() as [number, number, number];
  } catch {
    console.warn('Could not convert RGB to LCH, returning fallback');
    return [50, 0, 0];
  }
};

// Get artwork src for track and episode objects
export const getArtworkUrl = (track: TrackObject | EpisodeObject, index: number = 1): string => {
  const FALLBACK_IMAGE = '/spotify/spotify-green.png';

  if (index < 0 || index > 2) throw new Error('Artwork index out of range');

  const images = 'album' in track ? track.album?.images : track.images;
  if (!images?.length) return FALLBACK_IMAGE;

  return images[index]?.url || images[2]?.url || FALLBACK_IMAGE;
};

// Extract dominant color and palette from track cover art
export const extractTrackColor = async (track: TrackObject | EpisodeObject, thief: ColorThief) => {
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
      const timeout = setTimeout(() => reject(new Error('Image load timeout')), IMAGE_LOAD_TIMEOUT);

      img.onload = () => {
        clearTimeout(timeout);
        try {
          // Extract colors
          const dominantColor = thief.getColor(img, 2) as [number, number, number];
          const palette = (thief.getPalette(img) as [number, number, number][]) || [dominantColor];
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

    const lch = getLCH(dominantColor);

    return { track, dominantColor, colorPalette: palette, lch };
  } catch {
    console.error(`Image load timeout or unexpected error for ${track.name}, fallback used`);
    return {
      track,
      dominantColor: FALLBACK_COLOR,
      colorPalette: [FALLBACK_COLOR],
      lch: getLCH(FALLBACK_COLOR),
    };
  }
};

// Extract color from tracks in a batch
export const processTracksInBatches = async (
  tracks: (TrackObject | EpisodeObject)[],
  thief: ColorThief,
  setProgress: (val: number) => void,
  setProcessedTracks: (tracks: ProcessedTrack[]) => void
) => {
  const BATCH_SIZE = 5;
  const results = [];

  for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
    const batch = tracks.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map((track) => extractTrackColor(track, thief)));
    results.push(...batchResults);
    setProgress(results.length);
    setProcessedTracks([...results]);
  }
  return results;
};
