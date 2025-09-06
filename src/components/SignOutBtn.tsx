'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

export default function SignOutBtn() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleClick() {
    await signOut({
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: () => {
          router.push('/error');
        },
        onSuccess: () => {
          router.push('/');
        },
      },
    });
  }

  return (
    <button
      onClick={handleClick}
      className="btn hover:bg-black-active active:bg-black-active cursor-pointer rounded-lg bg-black px-4 py-2 font-semibold text-white transition dark:bg-white dark:text-black"
    >
      Sign out
    </button>
  );
}
