'use client';

import Link from 'next/link';
import HeaderDropdown from './HeaderDropdown';

export default function Header() {
  return (
    <header className="from-header-grad to-background fixed top-0 left-0 z-10 flex w-full items-center justify-between gap-4 bg-gradient-to-b px-6 py-3 lg:px-48">
      <Link href="/" className="relative bottom-[3px]">
        <h1 className="font-corben scale-x-110 scale-y-90 transform text-3xl font-bold tracking-widest md:text-4xl">
          hueify
        </h1>
        <div className="from-grad-1 via-grad-2 to-grad-3 relative top-[3px] -z-10 h-[3px] rounded-lg bg-gradient-to-r"></div>
      </Link>

      {/* Desktop menu */}
      <nav className="hidden items-center gap-4 space-x-6 md:flex">
        <Link href="/faq" className="desktop-header-item">
          About
        </Link>
        <HeaderDropdown />
      </nav>

      {/* Mobile menu button */}
      <button className="group rounded p-2 hover:bg-white-active active:bg-white-active duration-300 md:hidden">
        <span className="mb-1 block h-0.5 w-6 bg-secondary-text group-hover:bg-foreground group-active:bg-foreground duration-300"></span>
        <span className="mb-1 block h-0.5 w-6 bg-secondary-text group-hover:bg-foreground group-active:bg-foreground duration-300"></span>
        <span className="block h-0.5 w-6 bg-secondary-text group-hover:bg-foreground group-active:bg-foreground duration-300"></span>
      </button>
    </header>
  );
}
