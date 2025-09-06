'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

type SignOutBtnProps = {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export default function SignOutBtn({ onClick }: SignOutBtnProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (onClick) {
      // Close mobile menu
      onClick(event);
    }

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
      disabled={isPending}
      className="btn hover:bg-black-active active:bg-black-active cursor-pointer rounded-lg bg-black px-4 py-2 font-semibold text-white transition dark:bg-white dark:text-black"
    >
      Sign out
    </button>
  );
}
