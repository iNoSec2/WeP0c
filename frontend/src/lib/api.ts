/**
 * Central API URL configuration for Docker container networking
 */

// Docker service configuration - the only supported backend URL
const API_SERVICE = 'api';
const API_PORT = '8001';
const DOCKER_API_URL = `http://${API_SERVICE}:${API_PORT}`;

/**
 * Get the backend URL for API requests
 * In Docker environments, this always returns the Docker service URL
 */
export function getBackendURL(): string {
    // Always return Docker service URL - this is the only supported configuration
    return DOCKER_API_URL;
}

/**
 * Get all possible backend URLs to try in sequence for fallback mechanisms
 * In Docker, this only returns the Docker service URL
 */
export function getBackendURLs(): string[] {
    // Only return the Docker service URL - no fallbacks needed
    return [DOCKER_API_URL];
} 