'use client';
import { signIn } from '@/lib/client';

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-4xl font-bold mb-4">Chromify</h1>
      <button
        className="bg-green-500 text-white px-6 py-3 rounded-lg cursor-pointer"
        onClick={signIn}
      >
        Sign in with Spotify
      </button>
    </div>
  );
}
