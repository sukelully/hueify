import Link from 'next/link';
import SignInBtn from '@/components/ui/SignInBtn';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-16">
      {session ? (
        <Link
          href="/dashboard"
          className="btn hover:bg-black-active active:bg-black-active text-md flex items-center gap-2 rounded-full bg-black px-6 py-3 text-white sm:gap-3 sm:text-lg dark:bg-white dark:text-black"
        >
          Get started
        </Link>
      ) : (
        <SignInBtn />
      )}
    </div>
  );
}
