import { NextRequest, NextResponse } from 'next/server';
import { createHueifyPlaylistFromLink } from '@/lib/hueifyActions';

export async function POST(req: NextRequest) {
  try {
    const { playlistUrl, playlistName } = await req.json();
    const link = await createHueifyPlaylistFromLink(playlistUrl, playlistName);
    return NextResponse.json({ link });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
