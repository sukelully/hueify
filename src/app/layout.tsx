import type { Metadata } from 'next';
import { geistSans, geistMono, corben } from '@/lib/fonts';
import Header from '@/components/Header/Header';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hueify',
  description: 'Sort Spotify playlists by color',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });

  // Redirect users if app is in development
  if (process.env.NODE_ENV === 'development' && session?.user?.id !== process.env.DEV_ID) {
    redirect('/under-construction');
  }

  return (
    <html lang="en" className="min-w-[280px] md:scroll-smooth">
      <head>
        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${corben.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
