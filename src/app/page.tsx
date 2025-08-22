'use client';
import { signIn } from '@/lib/auth-client';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen sm:px-16 px-4">
      <button
        onClick={signIn}
        className="sign-in-btn flex items-center gap-2 sm:gap-3 sm:text-lg text-md min-w-[180px] px-6 py-3"
      >
        <Image
          src="/spotify/spotify-black.png"
          alt="Spotify logo"
          width={24}
          height={24}
        />
        <span>Sign in with Spotify</span>
      </button>
    </div>
  );
}
