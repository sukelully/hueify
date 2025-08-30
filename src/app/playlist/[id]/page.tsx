import PlaylistClient from './PlaylistClient';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getPlaylistTracks } from '@/app/actions/spotifyClient';
import { redirect } from 'next/navigation';

export default async function PlaylistPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect('/signin');

  const tracks = await getPlaylistTracks(id);

  return (
    <div>
      <PlaylistClient id={id} tracks={tracks} />
    </div>
  );
}
