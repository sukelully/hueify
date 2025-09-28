'use client';

import GitHubIcon from '@/assets/github.svg';
import GitHubIconDark from '@/assets/github-dark.svg';
import { useDarkMode } from '@/hooks/useDarkMode';
import Image from 'next/image';

export function SourceLink() {
  const isDarkMode = useDarkMode();
  const gitHubIcon = isDarkMode ? GitHubIconDark : GitHubIcon;

  return (
    <a
      href="https://github.com/sukelully/hueify"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-2 left-2 z-50 flex items-center rounded bg-gray-800 px-3 py-1 text-xs text-white opacity-70 transition-opacity duration-300 hover:opacity-100 dark:bg-gray-200 dark:text-gray-900"
    >
      <Image src={gitHubIcon} alt="GitHub logo" className="mr-1 inline-block h-4 w-4" />
      View Source
    </a>
  );
}
