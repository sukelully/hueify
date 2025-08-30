'use client';

import Link from 'next/link';

type PlaylistClientProps = {
  id: string;
  tracks: any[];
};

export default function PlaylistClient({ id, tracks }: PlaylistClientProps) {
  if (!tracks || tracks.length === 0) {
    return (
      <div className="relative min-h-screen">
        <DashboardChevron />

        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h1>No tracks found in this playlist.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <DashboardChevron />

      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">{id}</h1>
        <ul className="flex flex-col gap-2">
          {tracks.map((track: any, index: number) => (
            <li key={index}>
              {track.track?.name} — {track.track?.artists.map((a: any) => a.name).join(', ')}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DashboardChevron() {
  return (
    <Link
      href="/dashboard"
      className="hover:bg-white-active active:bg-white-active absolute top-16 left-4 z-10 cursor-pointer rounded-lg p-2 duration-300 md:top-20 md:left-20"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="text-foreground h-8 w-8"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}
