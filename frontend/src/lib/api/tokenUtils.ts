import { UserRole } from '@/lib/api/users';

/**
 * Safely parses a JWT token payload without using external libraries
 * NOTE: This is only for UI purposes and should not be used for security decisions
 * 
 * @param token The JWT token to parse
 * @returns The decoded payload or null if invalid
 */
function parseToken<T>(token: string): T | null {
    try {
        // Split the token into parts
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        // Get the payload (middle part)
        const payload = parts[1];

        // Base64Url decode
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

/**
 * Extracts the user role from a JWT token
 * For UI purposes only - actual authorization happens on the server
 * 
 * @param token The JWT token to parse
 * @returns The user's role or undefined if not found/invalid
 */
export function getUserRoleFromToken(token: string): UserRole | undefined {
    const payload = parseToken<{ role?: UserRole }>(token);
    return payload?.role;
}

/**
 * Extracts the user ID from a JWT token
 * For UI purposes only - actual authorization happens on the server
 * 
 * @param token The JWT token to parse
 * @returns The user's ID or undefined if not found/invalid
 */
export function getUserIdFromToken(token: string): string | undefined {
    const payload = parseToken<{ sub?: string }>(token);
    return payload?.sub;
}

/**
 * Checks if a token is expired based on its exp claim
 * For UI purposes only - actual validation happens on the server
 * 
 * @param token The JWT token to check
 * @returns True if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
    const payload = parseToken<{ exp?: number }>(token);
    if (!payload?.exp) return true;

    // Get current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token is expired
    return payload.exp < currentTime;
} 