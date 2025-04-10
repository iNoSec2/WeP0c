import { UserRole } from '@/lib/api/users';

/**
 * Gets the auth token from cookies using native JavaScript
 * @returns The token or undefined if not found
 */
function getAuthTokenFromCookies(): string | undefined {
    if (typeof document === 'undefined') return undefined;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'token') {
            return decodeURIComponent(value);
        }
    }
    return undefined;
}

/**
 * Creates headers for API requests from client components
 * Adds authorization token from cookies and handles role-based headers
 * 
 * @param role Optional user role for permission-based headers
 * @param additionalHeaders Any additional headers to include
 * @returns Headers object for API requests
 */
export function createClientHeaders(
    role?: UserRole,
    additionalHeaders: Record<string, string> = {}
): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...additionalHeaders
    };

    // Add token from cookies if available
    const token = getAuthTokenFromCookies();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Add role for server-side handling
    if (role) {
        headers['X-User-Role'] = role;
    }

    // Add role override for super admins
    if (role === 'super_admin') {
        headers['X-Override-Role'] = 'true';
    }

    return headers;
}

/**
 * Creates multipart form data headers for file uploads
 * 
 * @param role Optional user role for permission-based headers
 * @returns Headers object for multipart form data requests
 */
export function createMultipartHeaders(role?: UserRole): Record<string, string> {
    // Don't include Content-Type as it will be set automatically with the boundary
    const headers: Record<string, string> = {};

    // Add token from cookies if available
    const token = getAuthTokenFromCookies();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Add role for server-side handling
    if (role) {
        headers['X-User-Role'] = role;
    }

    // Add role override for super admins
    if (role === 'super_admin') {
        headers['X-Override-Role'] = 'true';
    }

    return headers;
} 