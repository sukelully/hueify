'use client';

import { useState, useTransition } from 'react';
import { getUserPlaylists } from '@/lib/actions';
import { SimplifiedPlaylistObject } from '@/types/spotify/userPlaylists';
import PlaylistCard from './PlaylistCard';
import LoadingScreen from '@/components/ui/LoadingScreen';

type Session = {
  user: {
    name: string;
  };
};

export default function PlaylistsGrid({
  initialPlaylists,
  session,
}: {
  initialPlaylists: SimplifiedPlaylistObject[];
  session: Session;
}) {
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const [isPending, startTransition] = useTransition();

  const handleOffsetPlaylists = (delta: number) => {
    const newOffset = offset + delta;
    setOffset(newOffset);

    startTransition(async () => {
      try {
        const data = await getUserPlaylists(newOffset, limit);
        setPlaylists(data);
      } catch (err) {
        console.error('Failed to fetch playlists', err);
      }
    });
  };

  const refetch = () => {
    startTransition(async () => {
      try {
        const data = await getUserPlaylists(offset, limit);
        setPlaylists(data);
        console.log(playlists);
      } catch (err) {
        console.error('Failed to fetch playlists', err);
      }
    });
  };

  if (isPending) return <LoadingScreen />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-8 pt-20 sm:p-20">
      <h1 className="font-corben mb-4 text-3xl font-bold">
        Hello, {session.user.name.trim().split(' ')[0]}.
      </h1>
      <p className="text-secondary-text">Choose a playlist to get started.</p>

      <div className="mt-6 w-full max-w-5xl">
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {playlists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </ul>

        <ControlsRow
          playlistsOffset={offset}
          playlistsLimit={limit}
          userPlaylistsLength={playlists.length}
          onOffsetChange={handleOffsetPlaylists}
          onRefresh={refetch}
          isPending={isPending}
        />
      </div>
    </div>
  );
}

function ControlsRow({
  playlistsOffset,
  playlistsLimit,
  userPlaylistsLength,
  onOffsetChange,
  onRefresh,
  isPending,
}: {
  playlistsOffset: number;
  playlistsLimit: number;
  userPlaylistsLength: number;
  onOffsetChange: (offset: number) => void;
  onRefresh: () => void;
  isPending: boolean;
}) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <button
        className={`hover:bg-white-active active:bg-white-active cursor-pointer rounded-lg p-2 duration-300 ${playlistsOffset === 0 || isPending ? 'invisible' : ''}`}
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

      <button
        onClick={onRefresh}
        className={`hover:bg-white-active active:bg-white-active cursor-pointer rounded-lg p-2 duration-300 ${isPending ? 'cursor-not-allowed opacity-50' : ''}`}
        disabled={isPending}
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

      <button
        className={`hover:bg-white-active active:bg-white-active cursor-pointer rounded-lg p-2 duration-300 ${userPlaylistsLength !== playlistsLimit || isPending ? 'invisible' : ''}`}
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
