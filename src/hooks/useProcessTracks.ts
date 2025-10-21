'use client';

import { useState, useEffect } from 'react';
import ColorThief from 'colorthief';
import { getPlaylistTracks } from '@/lib/actions';
import { processTracksInBatches } from '@/utils/colorProcessing';
import type { ProcessedTrack } from '@/utils/colorProcessing';

export function useProcessTracks(playlistId: string) {
  const [processedTracks, setProcessedTracks] = useState<ProcessedTrack[]>([]);
  const [progress, setProgress] = useState(0);
  const [totalTracks, setTotalTracks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processColors = async () => {
      const tracks = await getPlaylistTracks(playlistId);
      setTotalTracks(tracks.length);
      if (tracks.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const thief = new ColorThief();
        await processTracksInBatches(tracks, thief, setProgress, setProcessedTracks);
      } catch {
        console.error('Error processing playlist colors');
      } finally {
        setIsLoading(false);
      }
    };

    processColors();
  }, [playlistId]);

  return { processedTracks, isLoading, progress, totalTracks };
}
