'use client';

import Link from 'next/link';
import HeaderDropdown from './HeaderDropdown';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="from-header-grad to-background fixed top-0 left-0 z-10 flex w-full items-center justify-between gap-4 bg-gradient-to-b px-6 py-3 lg:px-48">
      <Link href="/" className="flex flex-row gap-4">
        <Image
          src="/header/logo.png"
          alt="Hueify logo"
          width={32}
          height={32}
          className="object-contain"
        />
        <h1 className="font-corben relative bottom-[2px] scale-x-110 scale-y-90 transform text-3xl font-bold tracking-widest">
          hueify
        </h1>
      </Link>

      <nav className="flex items-center gap-4 space-x-6">
        <Link href="/about" className="desktop-header-item hidden md:block">
          About
        </Link>
        <HeaderDropdown />
      </nav>
    </header>
  );
}
