import { UserRole } from '@/lib/api/users';

/**
 * Generates appropriate headers for API requests based on user role
 * Automatically adds X-Override-Role header for SUPER_ADMIN users
 * 
 * @param token JWT token for authentication
 * @param userRole Current user's role
 * @param additionalHeaders Any additional headers to include
 * @returns Header object with appropriate authorization headers
 */
export function getAuthHeaders(
    token: string,
    userRole?: UserRole,
    additionalHeaders: Record<string, string> = {}
): Record<string, string> {
    const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...additionalHeaders
    };

    // Add override header if user is SUPER_ADMIN
    if (userRole === 'super_admin') {
        headers['X-Override-Role'] = 'true';
    }

    return headers;
}

/**
 * Determines if the current user can perform a specific action
 * Use this for UI-based permission checks (showing/hiding elements)
 * 
 * @param userRole Current user's role
 * @param allowedRoles Array of roles allowed to perform the action
 * @returns Boolean indicating if the user has permission
 */
export function hasPermission(
    userRole?: UserRole,
    allowedRoles: UserRole[] = []
): boolean {
    if (!userRole) return false;

    // SUPER_ADMIN always has permission
    if (userRole === 'super_admin') return true;

    // Check if user's role is in the allowed roles list
    return allowedRoles.includes(userRole);
}

/**
 * Role hierarchy for permission comparison
 * Higher index means more permissions
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
    'client': 0,
    'user': 0,
    'pentester': 1,
    'admin': 2,
    'super_admin': 3
};

/**
 * Checks if a user has at least the specified role level
 * Useful for role-based UI rendering
 * 
 * @param userRole Current user's role
 * @param minimumRole Minimum role required
 * @returns Boolean indicating if user meets the minimum role requirement
 */
export function hasMinimumRole(
    userRole?: UserRole,
    minimumRole: UserRole = 'client'
): boolean {
    if (!userRole) return false;
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
} 