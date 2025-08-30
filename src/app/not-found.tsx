import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-corben text-4xl font-bold">404</h1>
      <p className="text-secondary-text text-xl">Oops! That page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="btn hover:bg-black-active active:bg-black-active dark:active:bg-white-active dark:hover:bg-white-active text-md flex min-w-[180px] justify-center rounded-full bg-black px-6 py-3 text-white sm:text-lg dark:bg-white dark:text-black"
      >
        <span>Go back home</span>
      </Link>
    </div>
  );
}
