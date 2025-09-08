// import PlaylistClient from './SortedPlaylist';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getPlaylist } from '@/lib/actions';
import { redirect } from 'next/navigation';
import { PlaylistResponse } from '@/types/spotify/playlist';
import SortedPlaylist from './SortedPlaylist';

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
      {/* <PlaylistClient playlist={playlist} /> */}
      <SortedPlaylist playlist={playlist} />
    </div>
  );
}
