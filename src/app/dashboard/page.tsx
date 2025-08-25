'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import SignInBtn from '../components/misc/SignInBtn';

export default function Dashboard() {
  // access the session atom
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const router = useRouter();

  // Show loading state
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">Loading session...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error('Session error:', error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="cursor-pointer text-red-500">Error fetching session: {error.message}</p>
      </div>
    );
  }

  // If not signed in, prompt to sign in
  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-xl">You are not signed in.</p>
        <SignInBtn />
      </div>
    );
  }

  // Log example data
  console.log('Session data:', session);

  // Signed-in dashboard
  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-6 p-8 sm:p-20">
      <h1 className="mb-2 text-4xl font-bold">Welcome, {session.user.name}!</h1>

      <p className="text-gray-700">Your email: {session.user.email}</p>

      <div className="mt-4 flex gap-4">
        <button
          className="rounded-lg bg-red-500 px-6 py-2 text-white hover:bg-red-600"
          onClick={() => signOut(router)}
        >
          Sign Out
        </button>

        <button
          className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          onClick={() => {
            console.log('Refetching session...');
            refetch();
          }}
        >
          Refresh Session
        </button>
      </div>

      <pre className="w-full max-w-2xl overflow-auto rounded-lg bg-gray-100 p-4">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}
