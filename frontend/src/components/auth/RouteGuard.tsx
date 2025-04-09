'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Role } from '@/types/user'
import { LoadingSpinner } from '@/components/ui/loading'

interface RouteConfig {
    path: string
    roles: Role[]
}

// Define route access configuration
const routeAccess: RouteConfig[] = [
    { path: '/dashboard', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER, Role.CLIENT, Role.USER] },
    { path: '/admin', roles: [Role.SUPER_ADMIN, Role.ADMIN] },
    { path: '/projects', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER, Role.CLIENT] },
    { path: '/vulnerabilities', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER] },
    { path: '/pentests', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER] },
    { path: '/client', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.CLIENT] },
    { path: '/users', roles: [Role.SUPER_ADMIN, Role.ADMIN] },
    { path: '/settings', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER, Role.CLIENT, Role.USER] },
    // Add pentester-specific routes
    { path: '/pentests/my-assignments', roles: [Role.PENTESTER] },
    { path: '/pentests/reports', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER] },
    { path: '/pentests/tools', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER] },
    { path: '/pentests/methodology', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER] },
    { path: '/pentests/templates', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER] },
    { path: '/pentests/specialities', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER] },
    { path: '/pentests/calendar', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER] },
    { path: '/pentests/timesheets', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER] },
]

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password']

export function RouteGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Function to check if the current route is protected
        const checkRouteAccess = () => {
            // Allow access to public routes
            if (publicRoutes.includes(pathname)) {
                return true
            }

            // If user is not logged in and trying to access protected route
            if (!user && !publicRoutes.includes(pathname)) {
                router.push('/login')
                return false
            }

            // Find route configuration for current path
            const routeConfig = routeAccess.find(route =>
                pathname.startsWith(route.path)
            )

            // If route is not configured, deny access
            if (!routeConfig) {
                router.push('/unauthorized')
                return false
            }

            // Check if user's role is allowed
            if (!routeConfig.roles.includes(user?.role as Role)) {
                router.push('/unauthorized')
                return false
            }

            return true
        }

        if (!isLoading) {
            checkRouteAccess()
        }
    }, [user, isLoading, pathname, router])

    // Show loading state while checking authentication
    if (isLoading) {
        return <LoadingSpinner />
    }

    // If on public route or user has access, render children
    if (publicRoutes.includes(pathname) || user) {
        return <>{children}</>
    }

    // Don't render anything while redirecting
    return null
} 