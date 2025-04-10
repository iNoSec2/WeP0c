import { NextRequest, NextResponse } from 'next/server';
import { getBackendURL } from '@/lib/api';
import axios from 'axios';
import { UserRole } from '@/lib/api/users';

/**
 * Server-side token validation with backend verification
 * More secure than client-side token parsing
 * 
 * @param token The JWT token to validate
 * @returns User info if token is valid, null otherwise
 */
export async function validateToken(token: string) {
    try {
        // Call a backend endpoint to validate the token
        const backendURL = getBackendURL();
        const response = await axios.get(`${backendURL}/api/auth/validate`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Token validation failed:', error);
        return null;
    }
}

/**
 * Extracts token from request (cookies or headers)
 * 
 * @param req NextRequest object
 * @returns The token if found, null otherwise
 */
export function extractTokenFromRequest(req: NextRequest): string | null {
    // Try to get token from cookies
    const token = req.cookies.get('token')?.value;
    if (token) return token;

    // Try to get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return null;
}

/**
 * Helper function to create permission headers for backend requests
 * Handles override headers for admin users
 * 
 * @param role User's role
 * @param token Authentication token
 * @returns Headers object for backend requests
 */
export function createPermissionHeaders(role: UserRole | undefined, token: string): Record<string, string> {
    const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // Add override header for super_admin users
    if (role === 'super_admin') {
        headers['X-Override-Role'] = 'true';
    }

    return headers;
}

/**
 * Handles unauthorized errors with proper response
 * 
 * @param message Optional error message
 * @returns NextResponse with 401 status
 */
export function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
    return NextResponse.json(
        { error: message },
        { status: 401 }
    );
}

/**
 * Higher-order function to protect API routes with role-based permissions
 * 
 * @param handler The API route handler function
 * @param allowedRoles Array of roles allowed to access the route
 * @returns Protected route handler
 */
export function withPermission(
    handler: (req: NextRequest, token: string, role?: UserRole) => Promise<NextResponse>,
    allowedRoles: UserRole[] = []
) {
    return async (req: NextRequest): Promise<NextResponse> => {
        const token = extractTokenFromRequest(req);
        if (!token) return unauthorizedResponse('No valid token found');

        // Parse token for initial role check (client-side only for performance)
        const payload = parseToken<{ role?: UserRole }>(token);
        const role = payload?.role;

        // If super_admin, allow access regardless of specified roles
        if (role === 'super_admin') {
            return handler(req, token, role);
        }

        // For other roles, check if the role is allowed
        if (role && allowedRoles.includes(role)) {
            return handler(req, token, role);
        }

        return unauthorizedResponse('Insufficient permissions');
    };
}

/**
 * Simple token parsing for UI state - NOT for authorization decisions
 * 
 * @param token JWT token
 * @returns Parsed payload or null
 */
function parseToken<T>(token: string): T | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = parts[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
} 