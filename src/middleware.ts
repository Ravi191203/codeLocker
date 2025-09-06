import { NextResponse, type NextRequest } from 'next/server';

const COOKIE_NAME = 'session';

// This middleware is now only responsible for routing protection.
// It no longer performs any database lookups or session validation
// that would require loading Mongoose models, which resolves the error.
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(COOKIE_NAME);
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  // If the user is on an auth page...
  if (isAuthPage) {
    // and has a session, redirect to home.
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // and doesn't have a session, let them stay.
    return NextResponse.next();
  }

  // If the user is on a protected page and has no session, redirect to login.
  if (!sessionCookie) {
     const url = request.nextUrl.clone()
     url.pathname = '/login';
     return NextResponse.redirect(url);
  }

  // If the user is on a protected page and has a session, let them proceed.
  // The actual validation of the session will happen on the client-side
  // or in API routes/server components that can safely connect to the database.
  return NextResponse.next();
}

export const config = {
  // Protect all routes except for API routes, static files, images, and public pages.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|s).*)'],
};
