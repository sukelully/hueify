import { useState, useRef, useEffect } from 'react';
import { signIn, signOut, authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useClickOutside } from '@/hooks/useClickOutside';
import Image from 'next/image';
import Link from 'next/link';

export default function HeaderDropdown() {
  const { data: session } = authClient.useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useClickOutside(dropdownRef, () => setDropdownOpen(false));

  const handleSignOut = () => {
    setDropdownOpen(false);
    signOut(router);
  };

  return (
    <>
      {session ? (
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
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

          {dropdownOpen && (
            <div className="animate-fade-in absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-black">
              <ul className="flex flex-col">
                <li className="block md:hidden">
                  <Link
                    href="/about"
                    className="header-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    About
                  </Link>
                </li>
                <li className="block md:hidden">
                  <hr className="border-gray-200 dark:border-gray-700" />
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="header-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <hr className="border-gray-200 dark:border-gray-700" />
                </li>
                <li>
                  <button onClick={handleSignOut} className="header-dropdown-item">
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <button
          className="btn hover:bg-black-active active:bg-black-active cursor-pointer rounded-lg bg-black px-4 py-2 font-semibold text-white transition dark:bg-white dark:text-black"
          onClick={signIn}
        >
          Sign in
        </button>
      )}
    </>
  );
}
