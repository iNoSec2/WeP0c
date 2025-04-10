'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // User is not authenticated, redirect to login
      router.push('/login');
    } else if (!isLoading && user && requiredRole) {
      // Check if user has the required role
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      const hasRequiredRole = roles.includes(user.role);
      
      if (!hasRequiredRole) {
        console.log(`User role ${user.role} does not match required role(s):`, roles);
        // User doesn't have the required role, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router, requiredRole]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // If user is authenticated and has the required role (or no role is required), render children
  if (user && (!requiredRole || (Array.isArray(requiredRole) ? requiredRole.includes(user.role) : user.role === requiredRole))) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
      <Loading size="lg" />
    </div>
  );
}
