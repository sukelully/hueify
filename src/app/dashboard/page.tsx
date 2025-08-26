'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import SignInBtn from '@/app/components/misc/SignInBtn';
import PlaylistCard from '@/app/components/Dashboard/PlaylistCard';
import { useSpotifyData } from '@/app/hooks/useSpotifyData';

export default function Dashboard() {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const router = useRouter();
  const { userPlaylists, playlistsLoading, playlistsError } = useSpotifyData(session);

  if (isPending) return <LoadingScreen text="Loading session..." />;
  if (error) return <ErrorScreen message={error.message} />;
  if (!session) return <SignInScreen />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-6 p-8 sm:p-20">
      <h1 className="mb-2 text-4xl font-bold font-corben">Hello, {session.user.name}.</h1>
      <p className="text-gray-700 font-outfit">Let's get started.</p>

      <div className="mt-4 flex gap-4">
        <button
          className="cursor-pointer rounded-lg bg-red-500 px-6 py-2 text-white hover:bg-red-600"
          onClick={() => signOut(router)}
        >
          Sign Out
        </button>

        <button
          className="cursor-pointer rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          onClick={() => refetch()}
        >
          Refresh Session
        </button>
      </div>

      <div className="mt-6 w-full max-w-2xl">
        {playlistsLoading && <p>Loading playlists...</p>}
        {playlistsError && <p className="text-red-500">{playlistsError.message}</p>}
        {userPlaylists && (
          <ul className="space-y-2">
            {userPlaylists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Helper components
function LoadingScreen({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-xl">{text}</p>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="cursor-pointer text-red-500">Error: {message}</p>
    </div>
  );
}

function SignInScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-xl">You are not signed in.</p>
      <SignInBtn />
    </div>
  );
}