'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/loading';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // User is not authenticated, redirect to login
        router.push('/login');
      } else if (user.role !== 'super_admin' && user.role !== 'admin') {
        // User is not an admin, redirect to dashboard
        console.log(`User role ${user.role} is not admin or super_admin`);
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // If user is authenticated and is an admin, render children
  if (user && (user.role === 'super_admin' || user.role === 'admin')) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
      <Loading size="lg" />
    </div>
  );
}
