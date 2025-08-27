'use client';
import { signIn } from '@/lib/auth-client';
import Image from 'next/image';

export default function SignInBtn() {
  return (
    <button
      onClick={signIn}
      className="sign-in-btn btn hover:bg-black-active active:bg-black-active dark:active:bg-white-active dark:hover:bg-white-active text-md flex min-w-[180px] items-center gap-2 rounded-full bg-black px-6 py-3 text-white sm:text-lg md:gap-3 dark:bg-white dark:text-black"
    >
      <Image src="/spotify/spotify-green.png" alt="Spotify logo" width={24} height={24} />
      <span>Sign in with Spotify</span>
    </button>
  );
}
