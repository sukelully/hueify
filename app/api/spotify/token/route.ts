import { NextRequest, NextResponse } from 'next/server';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function GET() {
  const now = Date.now();

  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    console.log('Returning cached access token');
    return NextResponse.json({ access_token: cachedToken });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing Spotify client credentials' }, { status: 500 });
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  }).toString();

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch token from Spotify' },
        { status: response.status }
      );
    }

    const data: SpotifyTokenResponse = await response.json();

    cachedToken = data.access_token;
    tokenExpiry = now + data.expires_in * 1000;

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
