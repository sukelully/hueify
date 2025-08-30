import SignInBtn from "@/components/misc/SignInBtn";

export default function SignIn() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-3 max-w-md text-center">
        
        <p className="text-secondary-text">You&apos;re not signed in</p>
        <SignInBtn />
      </div>
    </div>
  );
}
