'use client';

import Link from 'next/link';
import HeaderDropdown from './HeaderDropdown';

export default function Header() {
  return (
    <header className="bg-background border-b-1 border-gray-200 fixed top-0 left-0 z-10 flex w-full items-center justify-between gap-4 px-6 py-3 sm:px-12">
      <Link href="/" className='relative bottom-[3px]'>
        <h1 className="font-corben scale-x-110 scale-y-90 transform text-3xl font-bold tracking-widest sm:text-4xl">
          hueify
        </h1>
        <div className='relative h-[3px] -z-10 bg-gradient-to-r from-grad-1 via-grad-2 to-grad-3 rounded-lg top-[3px]'></div>
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
