export default function LoadingScreen({ message }: { message?: string | null }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-black dark:border-gray-600 dark:border-t-white"></div>
      <p className="text-lg font-bold">{message}</p>
    </div>
  );
}
