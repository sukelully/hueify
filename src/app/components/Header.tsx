'use client';

import { signIn } from '@/lib/auth-client';
import Link from 'next/link';

export default function Header() {

  return (
    <header className="absolute top-0 left-0 w-full flex items-center justify-between sm:px-32 px-6 py-3 gap-4 z-10">
      <Link href="/">
        <h1 className="font-corben text-3xl font-bold tracking-widest transform scale-y-90 scale-x-110 sm:text-4xl">
          <span className="bg-gradient-to-r from-blue-600 via-fuchsia-400 to-rose-500 inline-block text-transparent bg-clip-text">
            hue
          </span>
          ify
        </h1>
      </Link>

      {/* Desktop menu */}
      <nav className="hidden md:flex space-x-6">
        <button
          className="border-2 rounded-lg px-3 py-1 cursor-pointer font-bold"
          onClick={signIn}
        >
          Sign in
        </button>
      </nav>

      {/* Mobile menu button */}
      <button className="md:hidden p-2 rounded hover:bg-gray-100">
        <span className="block w-6 h-0.5 bg-black mb-1"></span>
        <span className="block w-6 h-0.5 bg-black mb-1"></span>
        <span className="block w-6 h-0.5 bg-black"></span>
      </button>
    </header>
  );
}
