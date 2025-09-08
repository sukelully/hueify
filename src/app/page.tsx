import Link from 'next/link';
import SignInBtn from '@/components/SignInBtn';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-16">
      <SignInBtn isLogo />
    </div>
  );
}
