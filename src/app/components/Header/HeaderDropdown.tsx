import { useState, useRef, useEffect } from 'react';
import { signIn, signOut, authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function HeaderDropdown() {
  const { data: session } = authClient.useSession();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            className="flex items-center justify-center cursor-pointer focus:outline-none"
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
              <div className="bg-primary-foreground rounded-full p-1 flex items-center justify-center">
                <Image
                  src="/header/user-icon.svg"
                  className="rounded-full"
                  alt="User Icon"
                  width={34}
                  height={34}
                />
              </div>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
              <ul className="flex flex-col">
                <li>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <hr className="border-gray-200 dark:border-gray-700" />
                </li>
                <li>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <button
          className="sign-in-btn cursor-pointer rounded-lg bg-black dark:bg-white text-white dark:text-black px-4 py-2 font-semibold hover:bg-black/80 dark:hover:bg-white/80 transition"
          onClick={signIn}
        >
          Sign in
        </button>
      )}
    </>
  );
}
