import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(req: NextRequest) {
  const sessionCookie = getSessionCookie(req);

  // Optimistically redirects unauthenticated users
  // Still need to validate session in each page/route
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Routes middleware applies to
  matcher: ['/dashboard', '/playlist'],
};
