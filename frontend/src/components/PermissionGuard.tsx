'use client';

import React from 'react';
import { UserRole } from '@/lib/api/users';
import { hasPermission, hasMinimumRole } from '@/lib/api/permissionUtils';

interface PermissionGuardProps {
    requiredRoles?: UserRole[];
    minimumRole?: UserRole;
    currentRole?: UserRole;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user role
 * Provides a clean way to protect UI elements based on permissions
 * 
 * @example
 * // Only render for pentesters
 * <PermissionGuard requiredRoles={['pentester']} currentRole={user.role}>
 *   <CreateVulnerabilityButton />
 * </PermissionGuard>
 * 
 * @example
 * // Require at least admin level
 * <PermissionGuard minimumRole="admin" currentRole={user.role}>
 *   <AdminPanel />
 * </PermissionGuard>
 */
export default function PermissionGuard({
    requiredRoles,
    minimumRole,
    currentRole,
    fallback = null,
    children
}: PermissionGuardProps) {
    // Check if user has required role - either by specific roles or minimum role level
    const hasAccess = React.useMemo(() => {
        if (!currentRole) return false;

        if (requiredRoles && requiredRoles.length > 0) {
            return hasPermission(currentRole, requiredRoles);
        }

        if (minimumRole) {
            return hasMinimumRole(currentRole, minimumRole);
        }

        // If no requirements specified, allow access
        return true;
    }, [currentRole, requiredRoles, minimumRole]);

    // Render children only if user has required permissions
    return hasAccess ? <>{children}</> : <>{fallback}</>;
} 