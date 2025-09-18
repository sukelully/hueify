'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authClient } from '@/lib/auth-client';
import SignInBtn from '../SignInBtn';
import SignOutBtn from '../SignOutBtn';

export default function Header() {
  const { data: session } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function toggleDropdown() {
    setDropdownMenuOpen((prev) => !prev);
  }

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [{ href: '/help', label: 'Help & FAQ' }];

  return (
    <header className="from-header-grad to-background fixed top-0 left-0 z-10 w-full bg-gradient-to-b">
      <section className="flex items-center justify-between gap-4 px-6 py-3 lg:px-48">
        {/* Logo */}
        <Link href="/" className="flex flex-col items-center">
          {/* <Image
            src="/header/logo.png"
            alt="Hueify logo"
            width={32}
            height={32}
            className="object-contain"
          /> */}
          <h1 className="font-corben relative bottom-[2px] scale-x-110 scale-y-90 transform text-3xl font-bold tracking-widest">
            hueify
          </h1>
          <div className="h-1 w-full rounded-full bg-gradient-to-r from-[#9a6dc7] via-[#6c8ec7] to-[#6dc7bb] dark:from-[#7a4da7] dark:via-[#4c6ea7] dark:to-[#4da79b]"></div>
        </Link>

        {/* Right side (nav + auth) */}
        <div className="flex items-center gap-6">
          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="desktop-header-item">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="hover:bg-white-active active:bg-white-active block cursor-pointer rounded p-2 duration-300 md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <MobileMenuIcon isOpen={mobileMenuOpen} />
          </button>

          {/* Desktop auth section */}
          <div className="hidden md:block">
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex cursor-pointer items-center justify-center focus:outline-none"
                >
                  {session.user?.image ? (
                    <Image
                      className="rounded-full"
                      src={session.user.image}
                      alt="User profile image"
                      width={38}
                      height={38}
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-300">
                      <span className="text-sm font-medium">
                        {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </button>

                {/* Desktop dropdown */}
                {dropdownMenuOpen && (
                  <div className="bg-background absolute right-0 mt-2 w-48 rounded-xl shadow-lg ring-1 ring-black/10 dark:bg-neutral-900">
                    <nav className="flex flex-col p-2 text-lg">
                      <Link
                        href="/dashboard"
                        className="hover:bg-white-active active:bg-white-active dark:hover:bg-neutral rounded-lg px-3 py-2 transition-colors duration-300"
                      >
                        Dashboard
                      </Link>
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      <SignOutBtn onClick={() => setDropdownMenuOpen(false)} />
                    </nav>
                  </div>
                )}
              </div>
            ) : (
              <SignInBtn />
            )}
          </div>
        </div>
      </section>

      {/* Mobile menu */}
      <section
        className={`bg-background absolute w-full origin-top flex-col justify-center px-8 pt-4 text-2xl md:hidden ${
          mobileMenuOpen ? 'flex' : 'hidden'
        }`}
      >
        {/* Auth section in mobile menu */}
        {session ? (
          <SignOutBtn onClick={closeMobileMenu} />
        ) : (
          <SignInBtn onClick={closeMobileMenu} />
        )}

        {/* Navigation in mobile menu */}
        <nav className="flex min-h-screen flex-col gap-4 py-8">
          <hr className="border-gray-200 dark:border-gray-700" />
          {session && (
            <Link href="/dashboard" className="text-secondary-text" onClick={closeMobileMenu}>
              Dashboard
            </Link>
          )}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-secondary-text"
              onClick={closeMobileMenu}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </section>
    </header>
  );
}

function MobileMenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="relative h-6 w-6">
      <span
        className={`bg-secondary-text absolute left-0 block h-0.5 w-6 transition-all duration-300 ease-in-out ${
          isOpen ? 'top-3 rotate-45' : 'top-1'
        }`}
      ></span>
      <span
        className={`bg-secondary-text absolute top-3 left-0 block h-0.5 w-6 transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-0' : ''
        }`}
      ></span>
      <span
        className={`bg-secondary-text absolute left-0 block h-0.5 w-6 transition-all duration-300 ease-in-out ${
          isOpen ? 'top-3 -rotate-45' : 'top-5'
        }`}
      ></span>
    </div>
  );
}
