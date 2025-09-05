'use client';
import { signIn } from '@/lib/auth-client';
import Image from 'next/image';

export default function SignInBtn() {
  return (
    <button
      onClick={signIn}
      className="sign-in-btn btn btn hover:bg-black-active active:bg-black-active flex min-w-[180px] cursor-pointer items-center gap-2 rounded-full bg-black px-6 py-3 font-semibold text-white transition sm:text-lg dark:bg-white dark:text-black"
    >
      <Image src="/spotify/spotify-green.png" alt="Spotify logo" width={24} height={24} />
      <span>Continue with Spotify</span>
    </button>
  );
}
