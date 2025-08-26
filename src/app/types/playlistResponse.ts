interface ExternalUrls {
  spotify: string;
}

interface ImageObject {
  url: string;
  height: number | null;
  width: number | null;
}

interface PlaylistOwner {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  type: string;
  uri: string;
  display_name: string;
}

interface PlaylistTracks {
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
  tracks: PlaylistTracks;
  type: string;
  uri: string;
}

export interface SpotifyPlaylistsResponse {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SimplifiedPlaylistObject[];
}