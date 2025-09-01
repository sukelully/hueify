'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import PlaylistCard from './PlaylistCard';
import SignInScreen from '@/components/misc/SignInScreen';
import { useSpotifyData } from '@/hooks/useSpotifyData';

export default function Dashboard() {
  const [playlistsOffset, setPlaylistsOffset] = useState(0);
  const [playlistsLimit, setPlaylistsLimit] = useState(20);
  const { data: session, isPending, error: sessionError, refetch } = authClient.useSession();
  const { userPlaylists, playlistsLoading, playlistsError, accessTokenError } = useSpotifyData(
    session,
    playlistsOffset,
    playlistsLimit
  );

  const handleOffsetPlaylists = (offset: number) => {
    setPlaylistsOffset((prev) => prev + offset);
  };

  // If user is not signed in
  if (!session) return <SignInScreen />;

  // Error handling
  const anyError = sessionError || playlistsError || accessTokenError;
  if (anyError) {
    console.error(anyError);
    return <ErrorScreen />;
  }

  // Loading state
  if (isPending || playlistsLoading || !userPlaylists) return <LoadingScreen />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-8 pt-20 sm:p-20">
      <h1 className="font-corben mb-4 text-3xl font-bold">
        Hello, {session.user.name.trim().split(' ')[0]}.
      </h1>
      <p className="text-secondary-text">Choose a playlist to get started.</p>

      <div className="mt-6 w-full max-w-5xl">
        {/* Playlists Grid */}
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {userPlaylists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </ul>

        {/* Controls Row */}
        <ControlsRow
          playlistsOffset={playlistsOffset}
          playlistsLimit={playlistsLimit}
          userPlaylistsLength={userPlaylists.length}
          onOffsetChange={handleOffsetPlaylists}
          onRefresh={refetch}
        />
      </div>
    </div>
  );
}

// Helper components
function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-black dark:border-gray-600 dark:border-t-white"></div>
      <p className="text-secondary-text text-xl">Loading playlists</p>
    </div>
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

function ControlsRow({
  playlistsOffset,
  playlistsLimit,
  userPlaylistsLength,
  onOffsetChange,
  onRefresh,
}: {
  playlistsOffset: number;
  playlistsLimit: number;
  userPlaylistsLength: number;
  onOffsetChange: (offset: number) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between">
      {/* Left arrow */}
      <button
        className={`hover:bg-white-active active:bg-white-active cursor-pointer rounded-lg p-2 duration-300 ${playlistsOffset === 0 ? 'invisible' : ''}`}
        onClick={() => onOffsetChange(-20)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="text-foreground h-6 w-6 rotate-180"
          fill="currentColor"
        >
          <polygon points="7.293 4.707 14.586 12 7.293 19.293 8.707 20.707 17.414 12 8.707 3.293 7.293 4.707" />
        </svg>
      </button>

      {/* Refresh button */}
      <button
        onClick={onRefresh}
        className="hover:bg-white-active active:bg-white-active cursor-pointer rounded-lg p-2 duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="text-foreground h-6 w-6"
          fill="currentColor"
        >
          <path d="M 7.59375 3 L 9.0625 5 L 13 5 C 16.324219 5 19 7.675781 19 11 L 19 15 L 16 15 L 20 20.46875 L 24 15 L 21 15 L 21 11 C 21 6.59375 17.40625 3 13 3 Z M 4 3.53125 L 0 9 L 3 9 L 3 13 C 3 17.40625 6.59375 21 11 21 L 16.40625 21 L 14.9375 19 L 11 19 C 7.675781 19 5 16.324219 5 13 L 5 9 L 8 9 Z" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        className={`hover:bg-white-active active:bg-white-active cursor-pointer rounded-lg p-2 duration-300 ${userPlaylistsLength !== playlistsLimit ? 'invisible' : ''}`}
        onClick={() => onOffsetChange(20)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="text-foreground h-6 w-6"
          fill="currentColor"
        >
          <polygon points="7.293 4.707 14.586 12 7.293 19.293 8.707 20.707 17.414 12 8.707 3.293 7.293 4.707" />
        </svg>
      </button>
    </div>
  );
}
