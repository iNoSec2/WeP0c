import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from './types/user';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Check if the path is for admin routes
  const isAdminRoute = path.startsWith('/admin');

  // Get the user from localStorage (if available)
  const user = request.cookies.get('user')?.value;
  let userRole = '';

  if (user) {
    try {
      const userData = JSON.parse(user);
      userRole = userData.role;
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  // If it's an admin route and the user is not a super admin, redirect to dashboard
  if (isAdminRoute && userRole !== Role.SUPER_ADMIN) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
