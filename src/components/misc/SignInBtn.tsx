'use client';
import { signIn } from '@/lib/auth-client';
import Image from 'next/image';

export default function SignInBtn() {
  return (
    <button
      onClick={signIn}
      className="sign-in-btn btn btn hover:bg-black-active active:bg-black-active cursor-pointer flex px-6 py-3 sm:text-lg min-w-[180px] items-center gap-2 bg-black font-semibold text-white transition dark:bg-white dark:text-black rounded-full"
    >
      <Image src="/spotify/spotify-green.png" alt="Spotify logo" width={24} height={24} />
      <span>Continue with Spotify</span>
    </button>
  );
}
