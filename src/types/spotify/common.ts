export interface ExternalUrls {
  spotify: string;
}

export interface ImageObject {
  url: string;
  height: number | null;
  width: number | null;
}

export interface PlaylistOwner {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  type: string;
  uri: string;
  display_name: string | null;
}

export interface Paging<T> {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: T[];
}
