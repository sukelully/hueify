'use client';
import { useState } from 'react';
import { signIn } from '@/lib/auth-client';
import Image from 'next/image';

export type SignInBtnProps = {
  isLogo?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export default function SignInBtn({ isLogo = false, onClick }: SignInBtnProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (onClick) {
      // Close mobile menu
      onClick(event);
    }

    setIsPending(true);

    await signIn.social({
      provider: 'spotify',
      callbackURL: '/dashboard',
      errorCallbackURL: '/error',
    });

    setIsPending(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`sign-in-btn btn hover:bg-black-active active:bg-black-active cursor-pointer items-center bg-black font-semibold text-white transition dark:bg-white dark:text-black ${isLogo ? 'flex min-w-[180px] gap-2 rounded-full px-6 py-3 sm:text-lg' : 'rounded-lg px-4 py-2'}`}
    >
      {isLogo && (
        <Image src="/spotify/spotify-green.png" alt="Spotify logo" width={24} height={24} />
      )}
      <span>{isLogo ? 'Continue with Spotify' : 'Sign in'}</span>
    </button>
  );
}
