import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getUserPlaylists } from '@/lib/actions';
import { SimplifiedPlaylistObject } from '@/types/spotify/userPlaylists';
import PlaylistsGrid from './PlaylistsGrid';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect('/signin');

  // Fetch playlists
  let playlists: SimplifiedPlaylistObject[] = [];
  try {
    playlists = await getUserPlaylists();
  } catch (error) {
    console.error(error);
    redirect('/error');
  }

  return <PlaylistsGrid initialPlaylists={playlists} session={session} />;
}
