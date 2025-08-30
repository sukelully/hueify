import PlaylistClient from './PlaylistClient';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getPlaylist } from '@/app/actions/spotifyClient';
import { redirect } from 'next/navigation';


export default async function PlaylistPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });


  if (!session) return redirect('/signin');

  const playlist = await getPlaylist(id);

  const tracks = playlist.tracks.items;
  for (const track of tracks) {
    const src = track.track?.album?.images?.[0]?.url ?? '/spotify/spotify-green.png';
    // console.log(src);
  }

  return (
    <div>
      <PlaylistClient playlist={playlist} tracks={tracks} />
    </div>
  );
}
