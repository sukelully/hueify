import Image from 'next/image';
import Link from 'next/link';
import { SimplifiedPlaylistObject } from '@/types/spotify/userPlaylists';

interface PlaylistCardProps {
  playlist: SimplifiedPlaylistObject;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <li className="flex cursor-pointer flex-col overflow-hidden rounded-lg bg-gray-200 transition duration-200 hover:scale-105 hover:bg-gray-300 active:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:active:bg-slate-600">
      <Link href={`/playlist/${playlist.id}`}>
        <div className="relative aspect-square w-full flex-shrink-0">
          <Image
            src={playlist.images?.[0]?.url ?? '/spotify/spotify-green.png'}
            alt={`${playlist.name} cover`}
            sizes="(width: 100%)"
            fill
            className="rounded-t-lg object-cover"
          />
        </div>

        <div className="flex flex-col items-center justify-center p-4">
          <h3
            className="w-full truncate text-center text-lg font-bold md:text-xl"
            title={playlist.name}
          >
            {playlist.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {playlist.tracks.total} {playlist.tracks.total !== 1 ? 'tracks' : 'track'}
          </p>
        </div>
      </Link>
    </li>
  );
}
