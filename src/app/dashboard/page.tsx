'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  // access the session atom
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        }
      }
    })
  }

  // Show loading state
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading session...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error('Session error:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Error fetching session: {error.message}</p>
      </div>
    );
  }

  // If not signed in, prompt to sign in
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-xl">You are not signed in.</p>
        <button
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          onClick={() => authClient.signIn.social({ provider: 'spotify', callbackURL: '/dashboard' })}
        >
          Sign in with Spotify
        </button>
      </div>
    );
  }

  // Log example data
  console.log('Session data:', session);

  // Signed-in dashboard
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8 sm:p-20 gap-6">
      <h1 className="text-4xl font-bold mb-2">
        Welcome, {session.user.name}!
      </h1>

      <p className="text-gray-700">
        Your email: {session.user.email}
      </p>

      <div className="flex gap-4 mt-4">
        <button
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          onClick={handleSignOut}
        >
          Sign Out
        </button>

        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={() => {
            console.log('Refetching session...');
            refetch();
          }}
        >
          Refresh Session
        </button>
      </div>

      <pre className="bg-gray-100 p-4 rounded-lg w-full max-w-2xl overflow-auto">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}
