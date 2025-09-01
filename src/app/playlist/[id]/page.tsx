import PlaylistClient from './PlaylistClient';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getPlaylist } from '@/lib/actions';
import { redirect } from 'next/navigation';
import { PlaylistResponse } from '@/types/spotify/playlist';

type Params = {
  params: Promise<{ id: string }>;
};

export default async function PlaylistPage({ params }: Params) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect('/signin');

  const playlist: PlaylistResponse = await getPlaylist(id);

  return (
    <div>
      <PlaylistClient playlist={playlist} />
    </div>
  );
}
