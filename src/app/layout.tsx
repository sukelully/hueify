import type { Metadata } from 'next';
import { geistSans, geistMono, corben } from '@/lib/fonts';
import Header from '@/components/Header/Header';
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
  return (
    <html lang="en" className="min-w-[280px] md:scroll-smooth">
      <head>
        <meta name="apple-mobile-web-app-title" content="Hueify" />
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
