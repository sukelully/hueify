'use client';
import { signIn } from '@/lib/auth-client';
import Image from 'next/image';

export default function SignInBtn() {
  return (
    <button
      onClick={signIn}
      className="sign-in-btn hover:bg-black-active active:bg-black-active dark:active:bg-white-active dark:hover:bg-white-active text-md flex min-w-[180px] items-center gap-2 bg-black px-6 py-3 text-white sm:gap-3 sm:text-lg dark:bg-white dark:text-black"
    >
      <Image src="/spotify/spotify-green.png" alt="Spotify logo" width={24} height={24} />
      <span>Sign in with Spotify</span>
    </button>
  );
}