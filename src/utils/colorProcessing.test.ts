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

test('getArtwork throws error with incorrect index', () => {
  const track = { album: { images: [] } } as any;
  expect(() => getArtworkUrl(track, 3)).toThrow(Error);
  expect(() => getArtworkUrl(track, 3)).toThrow('Artwork index out of range');
});

test('getArtworkUrl returns correct url', () => {
  expect(getArtworkUrl(trackResponseSample, 0)).toBe(
    'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228'
  );
});

const trackResponseSample = {
  album: {
    album_type: 'compilation',
    total_tracks: 9,
    available_markets: ['CA', 'BR', 'IT'],
    external_urls: {
      spotify: 'string',
    },
    href: 'string',
    id: '2up3OPMp9Tb4dAKM2erWXQ',
    images: [
      {
        url: 'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
        height: 300,
        width: 300,
      },
    ],
    name: 'string',
    release_date: '1981-12',
    release_date_precision: 'year',
    restrictions: {
      reason: 'market',
    },
    type: 'album',
    uri: 'spotify:album:2up3OPMp9Tb4dAKM2erWXQ',
    artists: [
      {
        external_urls: {
          spotify: 'string',
        },
        href: 'string',
        id: 'string',
        name: 'string',
        type: 'artist',
        uri: 'string',
      },
    ],
  },
  artists: [
    {
      external_urls: {
        spotify: 'string',
      },
      href: 'string',
      id: 'string',
      name: 'string',
      type: 'artist',
      uri: 'string',
    },
  ],
  available_markets: ['string'],
  disc_number: 0,
  duration_ms: 0,
  explicit: false,
  external_ids: {
    isrc: 'string',
    ean: 'string',
    upc: 'string',
  },
  external_urls: {
    spotify: 'string',
  },
  href: 'string',
  id: 'string',
  is_playable: false,
  linked_from: {},
  restrictions: {
    reason: 'string',
  },
  name: 'string',
  popularity: 0,
  preview_url: 'string',
  track_number: 0,
  type: 'track',
  uri: 'string',
  is_local: false,
};
