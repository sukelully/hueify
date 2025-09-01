'use client';

import Link from 'next/link';
import HeaderDropdown from './HeaderDropdown';

export default function Header() {
  return (
    <header className="from-header-grad to-background fixed top-0 left-0 z-10 flex w-full items-center justify-between gap-4 bg-gradient-to-b px-6 py-3 lg:px-48">
      <div className="flex flex-row gap-4">
        {/* <Image src="/header/logo3.png" alt="Hueify logo" width={32} height={32} className='object-contain'/> */}
        <Link href="/" className="relative bottom-[5px]">
          <h1 className="font-corben scale-x-110 scale-y-90 transform text-3xl font-bold tracking-widest md:text-4xl">
            hueify
          </h1>
          <div className="from-grad-1 via-grad-2 to-grad-3 relative top-[3px] -z-10 h-[3px] rounded-lg bg-gradient-to-r"></div>
        </Link>
      </div>

      <nav className="flex items-center gap-4 space-x-6">
        <Link href="/about" className="desktop-header-item hidden md:block">
          About
        </Link>
        <HeaderDropdown />
      </nav>
    </header>
  );
}
