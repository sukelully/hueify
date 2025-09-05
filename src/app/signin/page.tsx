import SignInBtn from '@/components/ui/SignInBtn';

export default function SignIn() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex max-w-md flex-col items-center justify-center gap-3 text-center">
        <p className="text-secondary-text">You&apos;re not signed in</p>
        <SignInBtn />
      </div>
    </div>
  );
}
