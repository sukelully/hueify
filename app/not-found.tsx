import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold font-corben">404</h1>
      <p className="text-xl text-secondary-text">Oops! That page doesn't exist.</p>
      <Link href="/" className="btn hover:bg-black-active active:bg-black-active dark:active:bg-white-active dark:hover:bg-white-active text-md min-w-[180px] rounded-full bg-black px-6 py-3 text-white sm:text-lg dark:bg-white dark:text-black">
        Go back home
      </Link>
    </div>
  );
}