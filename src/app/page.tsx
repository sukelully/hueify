import SignInBtn from '@/components/SignInBtn';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-16">
      {/* Hero Section */}
      <div className="relative h-60 w-full overflow-hidden md:h-96">
        <div className="hero-bg" />

        {/* Gradient overlay for fade edges */}
        <div className="from-background pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent to-5%"></div>
        <div className="from-background pointer-events-none absolute inset-0 bg-gradient-to-l to-transparent to-5%"></div>
      </div>

      <div className="mt-8 max-w-xl">
        <p className="text-gray-800 md:text-xl dark:text-gray-200">
          Add a little{' '}
          <span className="relative font-bold">
            hue
            <span className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-gradient-to-r from-[#9a6dc7] via-[#6c8ec7] to-[#6dc7bb] dark:from-[#7a4da7] dark:via-[#4c6ea7] dark:to-[#4da79b]"></span>
          </span>{' '}
          to your playlists.
        </p>
      </div>

      {/* Sign-in Button */}
      <div className="mt-8">
        <SignInBtn isLogo />
      </div>

      <div className="mt-6 max-w-xl">
        <p className="text-center text-gray-800 dark:text-gray-200">
          Hueify is currently in developer mode. Please email{' '}
          <a
            href="mailto:luke@sukelully.dev"
            className="text-blue-600 underline dark:text-blue-400"
          >
            luke@sukelully.dev
          </a>{' '}
          to request access.
        </p>
      </div>
    </div>
  );
}
