import SignInBtn from './SignInBtn';

export default function SignInScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-xl">You are not signed in.</p>
      <SignInBtn />
    </div>
  );
}
