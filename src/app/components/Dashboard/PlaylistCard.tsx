import Image from 'next/image';

export default function PlaylistCard({ playlist }: any) {
  return (
    <li className="flex cursor-pointer items-center rounded-lg bg-gray-200 transition-colors duration-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600">
      <div className="relative h-24 w-24 flex-shrink-0">
        <Image
          src={playlist.images?.[0]?.url ?? '/spotify/spotify-green.png'}
          alt={`${playlist.name} cover`}
          fill
          className="rounded-md object-cover"
        />
      </div>
      <div className="flex w-full flex-col justify-center px-4">
        <h3 className="text-xl font-bold">{playlist.name}</h3>
        <p className="text-gray-600 dark:text-gray-400">
          {playlist.tracks.total} {playlist.tracks.total > 1 ? 'tracks' : 'track'}
        </p>
      </div>
    </li>
  );
}
