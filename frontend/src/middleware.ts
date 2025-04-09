import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/register', '/auth', '/unauthorized'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(publicPath => pathname === publicPath || pathname.startsWith(`${publicPath}/`))) {
    return NextResponse.next();
  }

  // Check for authentication token in cookies
  const token = request.cookies.get('token')?.value;

  // If no token is found, redirect to login
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Continue with authenticated request
  return NextResponse.next();
}

// See: https://nextjs.org/docs/advanced-features/middleware
export const config = {
  // Only run middleware on these paths
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
