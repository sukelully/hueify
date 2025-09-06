'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authClient } from '@/lib/auth-client';
import SignInBtn from '../SignInBtn';
import SignOutBtn from '../SignOutBtn';

export default function Header() {
  const { data: session } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // console.log(session);

  return (
    <header className="from-header-grad to-background left fixed top-0 z-10 w-full bg-gradient-to-b">
      <section className="flex items-center justify-between gap-4 px-6 py-3 lg:px-48">
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

        <div className="flex items-center gap-4 space-x-6">
          <nav className="flex items-center gap-4 space-x-6">
            <Link href="/about" className="desktop-header-item hidden md:block">
              About
            </Link>
            <Link href="/" className="desktop-header-item hidden md:block">
              Test
            </Link>
          </nav>
          {session ? (
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
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
                <div className="group hover:bg-white-active active:bg-white-active rounded p-2 duration-300">
                  <span className="bg-secondary-text group-hover:bg-foreground group-active:bg-foreground mb-1 block h-0.5 w-6 duration-300"></span>
                  <span className="bg-secondary-text group-hover:bg-foreground group-active:bg-foreground mb-1 block h-0.5 w-6 duration-300"></span>
                  <span className="bg-secondary-text group-hover:bg-foreground group-active:bg-foreground block h-0.5 w-6 duration-300"></span>
                </div>
              )}
            </button>
          ) : (
            <button onClick={() => setMobileMenuOpen((prev) => !prev)}>
              <div className="group hover:bg-white-active active:bg-white-active rounded p-2 duration-300">
                <span className="bg-secondary-text group-hover:bg-foreground group-active:bg-foreground mb-1 block h-0.5 w-6 duration-300"></span>
                <span className="bg-secondary-text group-hover:bg-foreground group-active:bg-foreground mb-1 block h-0.5 w-6 duration-300"></span>
                <span className="bg-secondary-text group-hover:bg-foreground group-active:bg-foreground block h-0.5 w-6 duration-300"></span>
              </div>
            </button>
          )}
        </div>
      </section>

      {/* Mobile menu */}
      <section
        className={`bg-background absolute mt-4 w-full origin-top flex-col justify-center px-8 text-2xl ${mobileMenuOpen ? 'flex' : 'hidden'}`}
      >
        {session ? <SignOutBtn /> : <SignInBtn />}
        <nav className="flex min-h-screen flex-col gap-4 py-8">
          <hr className="border-gray-200 dark:border-gray-700" />
          <Link href="/about" className="text-secondary-text">
            About
          </Link>
          <Link href="/" className="text-secondary-text">
            Test
          </Link>
        </nav>
      </section>
    </header>
  );
}
