import { ExternalUrls, PlaylistOwner, ImageObject, Paging } from './common';

interface Restrictions {
  reason: string;
}

interface SimplifiedArtistObject {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

interface AlbumObject {
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: ImageObject[];
  name: string;
  release_date: string;
  release_date_precision: string;
  restrictions?: Restrictions;
  type: string;
  uri: string;
  artists: SimplifiedArtistObject[];
}

interface ExternalIds {
  isrc?: string;
  ean?: string;
  upc?: string;
}

interface LinkedFrom {
  external_urls?: ExternalUrls;
  href?: string;
  id?: string;
  type?: string;
  uri?: string;
}

export interface TrackObject {
  album: AlbumObject;
  artists: SimplifiedArtistObject[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: ExternalIds;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  is_playable: boolean;
  linked_from?: LinkedFrom;
  restrictions?: Restrictions;
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: string;
  uri: string;
  is_local: boolean;
}

interface ResumePoint {
  fully_played: boolean;
  resume_position_ms: number;
}

export interface EpisodeObject {
  audio_preview_url: string | null;
  description: string;
  html_description: string;
  duration_ms: number;
  explicit: boolean;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: ImageObject[];
  is_externally_hosted: boolean;
  is_playable: boolean;
  language?: string;
  languages: string[];
  name: string;
  release_date: string;
  release_date_precision: string;
  resume_point: ResumePoint;
  type: string;
  uri: string;
  restrictions?: Restrictions;
}

interface AddedByObject {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  type: string;
  uri: string;
}

interface PlaylistTrackObject {
  added_at: string | null;
  added_by: AddedByObject | null;
  is_local: boolean;
  track: TrackObject | EpisodeObject;
}

type PlaylistTracks = Paging<PlaylistTrackObject>;

export interface PlaylistResponse {
  collaborative: boolean;
  description: string | null;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: ImageObject[];
  name: string;
  owner: PlaylistOwner;
  public: boolean;
  tracks: PlaylistTracks;
  type: string;
  uri: string;
}
