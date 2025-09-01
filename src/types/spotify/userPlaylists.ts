import { ExternalUrls, ImageObject, PlaylistOwner, Paging } from './common';

interface SimplifiedTracksObject {
  href: string;
  total: number;
}

export interface SimplifiedPlaylistObject {
  collaborative: boolean;
  description: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: ImageObject[];
  name: string;
  owner: PlaylistOwner;
  public: boolean;
  snapshot_id: string;
  tracks: SimplifiedTracksObject;
  type: string;
  uri: string;
}

export type SpotifyPlaylistsResponse = Paging<SimplifiedPlaylistObject>;
