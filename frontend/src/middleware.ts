import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from './types/user';
import { decodeJwt } from 'jose';

// Public routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/microsoft/callback', '/api'];

// Define route access by role
const ROLE_ACCESS = {
  [Role.SUPER_ADMIN]: ['*'], // Super admin can access everything
  [Role.ADMIN]: ['/dashboard', '/admin', '/projects', '/pentests', '/client', '/vulnerabilities', '/settings'],
  [Role.PENTESTER]: ['/dashboard', '/projects', '/pentests', '/vulnerabilities', '/settings'],
  [Role.CLIENT]: ['/dashboard', '/client', '/projects', '/pentests/reports', '/vulnerabilities', '/settings'],
  [Role.USER]: ['/dashboard', '/settings']
};

// Function to extract role and user ID from token without verification
function extractTokenData(token: string) {
  try {
    // Just decode without verification for now
    const decodedToken = decodeJwt(token);
    return {
      role: String(decodedToken.role || ''),
      userId: String(decodedToken.sub || '')
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return { role: '', userId: '' };
  }
}

// Check if we're in a redirect loop by looking at the number of redirects
function isInRedirectLoop(request: NextRequest): boolean {
  const redirectCount = request.headers.get('x-redirect-count');
  return redirectCount ? parseInt(redirectCount, 10) > 5 : false;
}

// Add redirect count header to track potential loops
function addRedirectCount(request: NextRequest, response: NextResponse): NextResponse {
  const currentCount = request.headers.get('x-redirect-count');
  const newCount = currentCount ? parseInt(currentCount, 10) + 1 : 1;
  response.headers.set('x-redirect-count', newCount.toString());
  return response;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Break redirect loops - emergency escape hatch
  if (isInRedirectLoop(request)) {
    console.error('Detected redirect loop, stopping middleware execution');
    return NextResponse.next();
  }

  // Skip middleware for API routes and static files
  if (path.startsWith('/api/') || path.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(publicPath => path === publicPath || path.startsWith(`${publicPath}/`))) {
    return NextResponse.next();
  }

  // Get the token from cookies (preferred) or authorization header
  const token = request.cookies.get('token')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  // If on login page with valid token, don't redirect (prevents loops)
  if (path === '/login' && token) {
    try {
      const { role } = extractTokenData(token);
      if (role) {
        // Allow access to login page even with token
        return NextResponse.next();
      }
    } catch (error) {
      // Token is invalid, but we're already on login page, so just proceed
      return NextResponse.next();
    }
  }

  if (!token) {
    // No token found, redirect to login - but only if not already there
    if (path !== '/login') {
      const response = NextResponse.redirect(new URL('/login', request.url));
      return addRedirectCount(request, response);
    }
    return NextResponse.next();
  }

  try {
    // Extract the data without verification
    const { role: userRole, userId } = extractTokenData(token);

    // For security, if we couldn't extract a role, redirect to login
    if (!userRole && path !== '/login') {
      const response = NextResponse.redirect(new URL('/login', request.url));
      // Clear invalid token
      response.cookies.delete('token');
      return addRedirectCount(request, response);
    }

    // Check if user has access to this route based on role
    const hasAccess = checkRoleAccess(userRole as Role, path);

    if (!hasAccess && path !== '/dashboard' && path !== '/login') {
      // User doesn't have permission for this route, redirect to dashboard
      const response = NextResponse.redirect(new URL('/dashboard', request.url));
      return addRedirectCount(request, response);
    }

    // Add user info to headers for the API
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userId);
    requestHeaders.set('x-user-role', userRole);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Error processing token:', error);

    // Clear invalid token, but only redirect if not already on login page
    if (path !== '/login') {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return addRedirectCount(request, response);
    }
    return NextResponse.next();
  }
}

/**
 * Check if a user with the given role has access to the specified path
 */
function checkRoleAccess(role: Role, path: string): boolean {
  // If role doesn't exist in our mapping, deny access
  if (!ROLE_ACCESS[role]) {
    return false;
  }

  const allowedPaths = ROLE_ACCESS[role];

  // Super admin can access everything
  if (allowedPaths.includes('*')) {
    return true;
  }

  // Check if the current path starts with any of the allowed paths for this role
  return allowedPaths.some(allowedPath => {
    return path === allowedPath || path.startsWith(`${allowedPath}/`);
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
