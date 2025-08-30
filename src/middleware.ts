import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // Optimistically redirects unauthenticated users
  // Still need to validate session in each page/route
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Routes middleware applies to
  matcher: ['/dashboard', '/playlist'],
};
