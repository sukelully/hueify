'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();

  function extractPlaylistId() {
    const match = inputValue.match(/playlist\/([a-zA-Z0-9]+)(\?|$)/);
    if (!match) {
      alert('Invalid Spotify playlist URL');
      return;
    }
    const playlistId = match[1];
    router.push(`/playlist/${playlistId}`);
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
            <span className="runded-full absolute bottom-[2px] left-0 h-[2px] w-full bg-gradient-to-r from-[#9a6dc7] via-[#6c8ec7] to-[#6dc7bb] dark:from-[#7a4da7] dark:via-[#4c6ea7] dark:to-[#4da79b]"></span>
          </span>{' '}
          to your playlists.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex overflow-hidden rounded-full border border-gray-300 transition-all focus-within:border-black focus-within:ring-2 focus-within:ring-black/20">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 border-none bg-white px-4 py-3 text-gray-900 placeholder-gray-500 outline-none sm:w-[300px]"
            placeholder="Enter Spotify public playlist link"
          />
          <button
            onClick={extractPlaylistId}
            className="cursor-pointer bg-black px-6 py-3 font-semibold whitespace-nowrap text-white transition-colors duration-200 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
