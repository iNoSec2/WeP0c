/**
 * Centralized API route configuration
 * Ensures consistent URL patterns between frontend and backend
 */

/**
 * User-related routes
 */
export const userRoutes = {
    // Base routes
    base: '/api/users',
    user: (id: string) => `/api/users/${id}`,

    // Role-specific routes
    clients: '/api/users/clients',
    createClient: '/api/users/clients/create',
    pentesters: '/api/users/pentesters',

    // Admin routes (privileged access)
    adminUsers: '/api/admin/users',
    adminUser: (id: string) => `/api/admin/users/${id}`,

    // Search and filter
    search: (query: string) => `/api/users/search?q=${encodeURIComponent(query)}`,
    filter: (role?: string) => role && role.toLowerCase() !== 'all' ?
        `/api/users?role=${encodeURIComponent(role.toLowerCase())}` :
        '/api/users'
};

/**
 * Project-related routes
 */
export const projectRoutes = {
    base: '/api/projects',
    project: (id: string) => `/api/projects/${id}`,
    clientProjects: (clientId: string) => `/api/projects/client/${clientId}`,
    pentesterProjects: (pentesterId: string) => `/api/projects/pentester/${pentesterId}`
};

/**
 * Authentication routes
 */
export const authRoutes = {
    login: '/api/auth/login',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
    profile: '/api/auth/profile'
};

/**
 * Normalize IDs across the application
 * Handles both string and numeric IDs
 * 
 * @param id The ID to normalize
 * @returns The normalized ID as a string
 */
export function normalizeId(id: string | number | undefined | null): string {
    if (id === undefined || id === null) return '';
    return String(id);
}

/**
 * Normalize role values to ensure consistency
 * 
 * @param role The role to normalize
 * @returns The normalized role, lowercase
 */
export function normalizeRole(role: string | undefined | null): string {
    if (!role) return '';
    return role.toLowerCase();
} 