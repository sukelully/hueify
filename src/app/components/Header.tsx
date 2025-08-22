"use client";

import { signIn } from "@/lib/auth-client";

export default function Header() {
  return (
    <header className="flex items-center justify-between sm:px-32 px-6 py-3 gap-4 sticky top-0 z-10">
      <h1 className="text-3xl font-bold tracking-widest transform scale-y-80 scale-x-110 sm:text-4xl">
        hueify
      </h1>

      {/* Desktop menu */}
      <nav className="hidden md:flex space-x-6">
        <button className="sign-in-btn px-4 py-1" onClick={signIn}>Sign in</button>
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
