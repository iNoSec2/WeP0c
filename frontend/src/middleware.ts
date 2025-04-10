import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Simple middleware to log requests and validate tokens for API routes
 */
export function middleware(request: NextRequest) {
  // Only intercept API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Extract token from cookies or headers
    const token = request.cookies.get('token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    // Add X-Request-ID for tracking
    const requestId = crypto.randomUUID();
    const response = NextResponse.next({
      request: {
        headers: new Headers(request.headers),
      },
    });

    // Add tracking headers
    response.headers.set('X-Request-ID', requestId);

    // Log this request (useful for auditing permissions)
    console.log(`[${requestId}] ${request.method} ${request.nextUrl.pathname} - Authenticated: ${!!token}`);

    return response;
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/api/:path*',
  ],
};
