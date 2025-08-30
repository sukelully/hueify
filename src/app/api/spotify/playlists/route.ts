import { NextRequest, NextResponse } from 'next/server';
import { SpotifyPlaylistsResponse } from '@/app/types/playlistResponse';

export async function GET(req: NextRequest) {
  // Get user token from request
  const token = req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Missing user access token' }, { status: 401 });
  }

  try {
    // Get search params (limit, offset) from request URL
    const { searchParams } = new URL(req.url);
    const offset = searchParams.get('offset') ?? 0;
    const limit = searchParams.get('limit') ?? '20';

    // Fetch playlists from spotify
    const response = await fetch(`https://api.spotify.com/v1/me/playlists?offset=${offset}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: response.status });
    }

    const data: SpotifyPlaylistsResponse = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
