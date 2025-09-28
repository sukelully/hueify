import SignInBtn from '@/components/SignInBtn';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function SignIn() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect('/dashboard');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mt-14 flex max-w-md flex-col items-center justify-center gap-3 text-center">
        <SignInBtn isLogo />
        <p className="text-secondary-text">
          Hueify is currently in developer mode with limited access while in testing. If you&apos;d
          like to try it, please contact{' '}
          <a
            href="mailto:luke@sukelully.dev"
            className="text-blue-600 underline dark:text-blue-400"
          >
            luke@sukelully.dev
          </a>
          .
        </p>
      </div>
    </div>
  );
}
