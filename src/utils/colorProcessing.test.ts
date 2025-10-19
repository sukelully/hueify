import { getLCH, getArtworkUrl } from './colorProcessing';
import { expect, test } from 'vitest';

test('getLCH converts RGB to LCH', () => {
  const [l, c, h] = getLCH([255, 0, 0]);

  expect(l).toBeCloseTo(53.24, 2);
  expect(c).toBeCloseTo(104.55, 2);
  expect(h).toBeCloseTo(40, 2);
});

test('getArtworkUrl returns fallback if no images', () => {
  const track = { album: { images: [] } } as any;
  expect(getArtworkUrl(track)).toBe('/spotify/spotify-green.png');
});
