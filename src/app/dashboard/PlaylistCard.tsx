import Image from 'next/image';
import Link from 'next/link';
import { SimplifiedPlaylistObject } from '@/types/playlistResponse';

interface PlaylistCardProps {
  playlist: SimplifiedPlaylistObject;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <li className="flex flex-col cursor-pointer rounded-lg bg-gray-200 hover:scale-105 transition duration-200 hover:bg-gray-300 active:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:active:bg-slate-600 overflow-hidden">
      <Link href={`/playlist/${playlist.id}`}>

        <div className="relative w-full aspect-square flex-shrink-0">
          <Image
            src={playlist.images?.[0]?.url ?? '/spotify/spotify-green.png'}
            alt={`${playlist.name} cover`}
            sizes="(width: 100%)"
            fill
            className="object-cover rounded-t-lg"
          />
        </div>

        <div className="flex flex-col justify-center items-center p-4">
          <h3
            className="text-lg md:text-xl font-bold text-center truncate w-full"
            title={playlist.name}
          >
            {playlist.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {playlist.tracks.total} {playlist.tracks.total !== 1 ? 'tracks' : 'track'}
          </p>
        </div>
      </Link>
    </li>
  );
}
