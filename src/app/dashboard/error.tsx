'use client';
import Link from 'next/link';

export default function DashboardError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-corben text-4xl font-bold">Oops!</h1>
      <p className="text-secondary-text text-xl">We had some trouble loading your playlists.</p>
      <Link
        href="/"
        className="btn hover:bg-black-active active:bg-black-active text-md flex min-w-[180px] justify-center rounded-full bg-black px-6 py-3 text-white sm:text-lg dark:bg-white dark:text-black"
      >
        <span>Go back home</span>
      </Link>
    </div>
  );
}
