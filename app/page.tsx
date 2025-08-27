'use client';

import Link from 'next/link';
import SignInBtn from './components/misc/SignInBtn';
import { authClient } from '@/lib/auth-client';

export default function Home() {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-16">
      {session ? (
        <Link
          href="/dashboard"
          className="btn hover:bg-black-active active:bg-black-active dark:active:bg-white-active dark:hover:bg-white-active text-md flex items-center gap-2 rounded-full bg-black px-6 py-3 text-white sm:gap-3 sm:text-lg dark:bg-white dark:text-black"
        >
          Get started
        </Link>
      ) : (
        <SignInBtn />
      )}
    </div>
  );
}
