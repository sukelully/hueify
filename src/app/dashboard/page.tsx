import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getUserPlaylists } from '@/app/actions/spotifyClient';
import SignInScreen from '@/components/misc/SignInScreen';
import { SimplifiedPlaylistObject } from '@/types/playlistResponse';
import PlaylistsGrid from './PlaylistsGrid';
import { redirect } from 'next/navigation';


export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/signin");
  
  // Fetch playlists
  let playlists: SimplifiedPlaylistObject[] = [];
  try {
    playlists = await getUserPlaylists();
  } catch (error) {
    console.error(error);
    return <ErrorScreen />;
  }

  return (
    <PlaylistsGrid initialPlaylists={playlists} session={session}/>
  );
}

function ErrorScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-corben mb-4 text-3xl font-bold">Oops.</h1>
      <p className="text-secondary-text">Something went wrong.</p>
    </div>
  );
}
