'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { SignInBtnProps } from './SignInBtn';

// Redirect to sign in page
export default function SignInBtn({ isLogo = false, onClick }: SignInBtnProps) {
  const router = useRouter();

  async function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (onClick) {
      // Close mobile menu
      onClick(event);
    }

    router.push('/signin');
  }

  return (
    <button
      onClick={handleClick}
      className={`sign-in-btn btn hover:bg-black-active active:bg-black-active cursor-pointer items-center bg-black font-semibold text-white transition dark:bg-white dark:text-black ${isLogo ? 'flex min-w-[180px] gap-2 rounded-full px-6 py-3 sm:text-lg' : 'rounded-lg px-4 py-2'}`}
    >
      {isLogo && (
        <Image src="/spotify/spotify-green.png" alt="Spotify logo" width={24} height={24} />
      )}
      <span>{isLogo ? 'Continue with Spotify' : 'Sign in'}</span>
    </button>
  );
}
