import type { Metadata } from 'next';
import { geistSans, geistMono, corben, outfit } from '@/lib/fonts';
import Header from './components/Header/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hueify',
  description: 'Sort Spotify playlists by color',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="md:scroll-smooth min-w-[280px]">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${corben.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
