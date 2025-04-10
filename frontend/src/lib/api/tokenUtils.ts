import { UserRole } from '@/lib/api/users';
import { jwtDecode } from 'jwt-decode';

/**
 * Extracts the user role from a JWT token
 * 
 * @param token The JWT token to decode
 * @returns The user's role or undefined if not found/invalid
 */
export function getUserRoleFromToken(token: string): UserRole | undefined {
    try {
        // Decode token to get its payload
        const decoded = jwtDecode<{ role?: UserRole }>(token);
        return decoded.role;
    } catch (error) {
        console.error('Error decoding token:', error);
        return undefined;
    }
}

/**
 * Extracts the user ID from a JWT token
 * 
 * @param token The JWT token to decode
 * @returns The user's ID or undefined if not found/invalid
 */
export function getUserIdFromToken(token: string): string | undefined {
    try {
        // Decode token to get its payload
        const decoded = jwtDecode<{ sub?: string }>(token);
        return decoded.sub;
    } catch (error) {
        console.error('Error decoding token:', error);
        return undefined;
    }
}

/**
 * Checks if a token is expired
 * 
 * @param token The JWT token to check
 * @returns True if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
    try {
        // Decode token to get its expiration
        const decoded = jwtDecode<{ exp?: number }>(token);
        if (!decoded.exp) return true;

        // Get current time in seconds
        const currentTime = Math.floor(Date.now() / 1000);

        // Check if token is expired
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true; // Assume expired if we can't decode
    }
} 