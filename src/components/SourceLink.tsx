'use client';

import { useDarkMode } from '@/hooks/useDarkMode';
import Image from 'next/image';

export function SourceLink() {
  const isDarkMode = useDarkMode();

  return (
    <a
      href="https://github.com/sukelully/hueify"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-2 left-2 z-50 flex items-center rounded bg-gray-800 px-3 py-1 text-xs text-white opacity-70 transition-opacity duration-300 hover:opacity-100 dark:bg-gray-200 dark:text-gray-900"
    >
      <Image
        src={isDarkMode ? '/github/github-dark.svg' : '/github/github.svg'}
        alt="GitHub logo"
        width={16}
        height={16}
        className="mr-1 inline-block h-4 w-4"
      />
      View Source
    </a>
  );
}
