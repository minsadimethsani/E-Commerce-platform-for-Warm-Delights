import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy (formerly Middleware) Route Guard.
 * Checks for administrative session cookies before serving any /admin sub-route.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept any incoming request pointing to /admin or its sub-routes
  if (pathname.startsWith('/admin')) {
    const sessionActive = request.cookies.get('session-active')?.value;
    const sessionRole = request.cookies.get('session-role')?.value;

    // If there is no valid active admin session, redirect to the login page
    if (sessionActive !== 'true' || sessionRole !== 'admin') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect /admin/dashboard to /admin to resolve it to the overview page
    if (pathname === '/admin/dashboard') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
