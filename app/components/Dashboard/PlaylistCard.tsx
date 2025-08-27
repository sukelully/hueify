import Image from 'next/image';
import { SimplifiedPlaylistObject } from '@/app/types/playlistResponse';

interface PlaylistCardProps {
  playlist: SimplifiedPlaylistObject;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <li className="flex flex-row sm:flex-col cursor-pointer rounded-lg bg-gray-200 transition-colors duration-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 overflow-hidden">
      {/* Album cover */}
      <div className="relative sm:w-full w-1/4 aspect-square flex-shrink-0">
        <Image
          src={playlist.images?.[0]?.url ?? '/spotify/spotify-green.png'}
          alt={`${playlist.name} cover`}
          fill
          className="object-cover rounded-t-lg"
        />
      </div>

      {/* Playlist info */}
      <div className="flex flex-col justify-center sm:items-center p-4">
        <h3
          className="text-lg md:text-xl font-bold text-center truncate w-full"
          title={playlist.name}
        >
          {playlist.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
          {playlist.tracks.total} {playlist.tracks.total !== 1 ? 'tracks' : 'track'}
        </p>
      </div>
    </li>
  );
}
