// import PlaylistClient from './SortedPlaylist';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { getPlaylist } from '@/lib/actions';
import { redirect } from 'next/navigation';
import { PlaylistResponse } from '@/types/spotify/playlist';
import PlaylistClient from './PlaylistClient';

type Params = {
  params: Promise<{ id: string }>;
};

export default async function PlaylistPage({ params }: Params) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect('/signin');

  const playlist: PlaylistResponse = await getPlaylist(id);

  return (
    <div className="relative flex h-screen flex-col items-center p-4">
      <DashboardChevron />
      <div className="mt-14 w-full flex-1 overflow-hidden md:mt-18">
        <PlaylistClient playlist={playlist} />
      </div>
    </div>
  );
}

function DashboardChevron() {
  return (
    <Link
      href="/dashboard"
      className="hover:bg-white-active active:bg-white-active bg-background fixed top-18 left-4 z-5 cursor-pointer rounded-lg p-2 transition-colors duration-300 md:top-20"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="text-secondary-text h-8 w-8"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}
