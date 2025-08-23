'use client';
import { signIn } from '@/lib/auth-client';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-16">
      <button
        onClick={signIn}
        className="sign-in-btn hover:bg-black-hover dark:hover:bg-white-hover text-md flex min-w-[180px] items-center gap-2 bg-black px-6 py-3 text-white sm:gap-3 sm:text-lg dark:bg-white dark:text-black"
      >
        <Image src="/spotify/spotify-green.png" alt="Spotify logo" width={24} height={24} />
        <span>Sign in with Spotify</span>
      </button>
    </div>
  );
}
