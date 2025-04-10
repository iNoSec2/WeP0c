'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Role } from '@/types/user'

interface RoleGuardProps {
    children: ReactNode
    allowedRoles: Role[]
    fallback?: ReactNode
}

/**
 * A component that conditionally renders its children based on user role.
 * 
 * @param children - The content to render if the user has permission
 * @param allowedRoles - Array of roles that are allowed to see the content
 * @param fallback - Optional content to show if user doesn't have permission (defaults to null)
 */
export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
    const { user, hasPermission } = useAuth()

    // If no user is logged in, show fallback
    if (!user) {
        return <>{fallback}</>;
    }

    // Check if user has any of the required roles
    if (hasPermission(allowedRoles)) {
        return <>{children}</>;
    }

    // User doesn't have permission, show fallback
    return <>{fallback}</>;
} 