'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Role } from '@/types/user'
import { LoadingSpinner } from '@/components/ui/loading'

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth/login',
    '/auth/register',
    '/auth/microsoft/callback'
];

// Role-based route access configuration
const ROUTE_ACCESS_CONFIG = {
    '/dashboard': [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER, Role.CLIENT, Role.USER],
    '/admin': [Role.SUPER_ADMIN, Role.ADMIN],
    '/admin/users': [Role.SUPER_ADMIN],
    '/users': [Role.SUPER_ADMIN],
    '/user-management': [Role.SUPER_ADMIN],
    '/projects': [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER, Role.CLIENT],
    '/projects/create': [Role.SUPER_ADMIN, Role.ADMIN],
    '/pentests': [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER, Role.CLIENT],
    '/pentests/my-assignments': [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    '/pentests/reports': [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER, Role.CLIENT],
    '/pentests/tools': [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    '/pentests/methodology': [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    '/pentests/templates': [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    '/pentests/specialities': [Role.SUPER_ADMIN, Role.ADMIN],
    '/pentests/calendar': [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    '/pentests/timesheets': [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER],
    '/client': [Role.SUPER_ADMIN, Role.ADMIN, Role.CLIENT],
    '/vulnerabilities': [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER, Role.CLIENT],
    '/settings': [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER, Role.CLIENT, Role.USER],
};

export function RouteGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        // Function to check if the current route is protected and authorized
        const checkRouteAccess = () => {
            // Allow access to public routes
            if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
                setAuthorized(true)
                return true
            }

            // If user is not logged in and trying to access protected route
            if (!user) {
                router.push('/login')
                setAuthorized(false)
                return false
            }

            // Find the most specific route configuration that matches the current path
            const matchingRoutes = Object.entries(ROUTE_ACCESS_CONFIG)
                .filter(([route]) => pathname.startsWith(route))
                .sort((a, b) => b[0].length - a[0].length); // Sort by route length (most specific first)

            const matchedRoute = matchingRoutes[0];

            // If no route configuration found, default to dashboard
            if (!matchedRoute) {
                router.push('/dashboard')
                setAuthorized(false)
                return false
            }

            const [_, allowedRoles] = matchedRoute;

            // Super admin can access everything
            if (user.role === Role.SUPER_ADMIN) {
                setAuthorized(true)
                return true
            }

            // Check if user's role is allowed for this route
            if (!allowedRoles.includes(user.role)) {
                router.push('/dashboard')
                setAuthorized(false)
                return false
            }

            // User is authorized to access this route
            setAuthorized(true)
            return true
        }

        if (!isLoading) {
            checkRouteAccess()
        }
    }, [user, isLoading, pathname, router])

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner className="w-8 h-8" />
            </div>
        )
    }

    // If user is authorized (or on public route), render children
    if (authorized) {
        return <>{children}</>
    }

    // Show loading while unauthorized and redirecting
    return (
        <div className="flex h-screen items-center justify-center">
            <LoadingSpinner className="w-8 h-8" />
        </div>
    )
} 