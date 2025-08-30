import { Geist, Geist_Mono, Corben, Outfit } from 'next/font/google';

export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const corben = Corben({
  variable: '--font-corben',
  subsets: ['latin'],
  weight: '400',
});

export const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: '400',
});
