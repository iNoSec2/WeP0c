'use client';

import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/user';
import React from 'react';

interface RoleBasedContentProps {
    allowedRoles: Role[] | Role;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders content based on the user's role
 */
export const RoleBasedContent: React.FC<RoleBasedContentProps> = ({
    allowedRoles,
    children,
    fallback = null
}) => {
    const { user, isLoading } = useAuth();

    // Convert single role to array for consistent handling
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Handle loading state
    if (isLoading) {
        return null;
    }

    // Check if user exists and has one of the required roles
    if (user && roles.includes(user.role as Role)) {
        return <>{children}</>;
    }

    // Render fallback content if user doesn't have permission
    return <>{fallback}</>;
};

/**
 * Higher order component for role-based access control
 */
export function withRoleCheck(WrappedComponent: React.ComponentType<any>, allowedRoles: Role[] | Role) {
    return function WithRoleCheckComponent(props: any) {
        return (
            <RoleBasedContent allowedRoles={allowedRoles}>
                <WrappedComponent {...props} />
            </RoleBasedContent>
        );
    };
}

/**
 * Specific component for super admin only content
 */
export const SuperAdminOnly: React.FC<{ children: React.ReactNode, fallback?: React.ReactNode }> = ({
    children,
    fallback
}) => {
    return (
        <RoleBasedContent allowedRoles={Role.SUPER_ADMIN} fallback={fallback}>
            {children}
        </RoleBasedContent>
    );
};

/**
 * Component for admin content (super admin and admin)
 */
export const AdminOnly: React.FC<{ children: React.ReactNode, fallback?: React.ReactNode }> = ({
    children,
    fallback
}) => {
    return (
        <RoleBasedContent allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN]} fallback={fallback}>
            {children}
        </RoleBasedContent>
    );
};

/**
 * Component for pentester content
 */
export const PentesterOnly: React.FC<{ children: React.ReactNode, fallback?: React.ReactNode }> = ({
    children,
    fallback
}) => {
    return (
        <RoleBasedContent allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER]} fallback={fallback}>
            {children}
        </RoleBasedContent>
    );
};

/**
 * Component for client content
 */
export const ClientOnly: React.FC<{ children: React.ReactNode, fallback?: React.ReactNode }> = ({
    children,
    fallback
}) => {
    return (
        <RoleBasedContent allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.CLIENT]} fallback={fallback}>
            {children}
        </RoleBasedContent>
    );
}; 