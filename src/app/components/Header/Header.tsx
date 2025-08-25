'use client';

import Link from 'next/link';
import HeaderDropdown from './HeaderDropdown';

export default function Header() {
  return (
    <header className="bg-background fixed top-0 left-0 z-10 flex w-full items-center justify-between gap-4 px-6 py-3 sm:px-12">
      <Link href="/">
        <h1 className="font-corben scale-x-110 scale-y-90 transform text-3xl font-bold tracking-widest sm:text-4xl">
          <span className="inline-block bg-gradient-to-r from-blue-600 via-fuchsia-400 to-rose-500 bg-clip-text text-transparent">
            hue
          </span>
          ify
        </h1>
      </Link>

      {/* Desktop menu */}
      <nav className="hidden space-x-6 md:flex">
        <HeaderDropdown />
      </nav>

      {/* Mobile menu button */}
      <button className="rounded p-2 hover:bg-gray-100 md:hidden">
        <span className="mb-1 block h-0.5 w-6 bg-black"></span>
        <span className="mb-1 block h-0.5 w-6 bg-black"></span>
        <span className="block h-0.5 w-6 bg-black"></span>
      </button>
    </header>
  );
}
