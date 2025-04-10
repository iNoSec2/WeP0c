/**
 * API Configuration
 * Central place for API-related configuration that can be easily adjusted
 */

// Base URL configurations
const API_CONFIG = {
    // Docker container URL - inside Docker network
    DOCKER_URL: 'http://api:8001',

    // Local development URLs (only used as fallbacks)
    LOCAL_URLS: [
        'http://localhost:8001',
        'http://127.0.0.1:8001',
    ],

    // Environment variable override (from .env)
    ENV_URL: process.env.NEXT_PUBLIC_API_URL,

    // Request timeouts (ms)
    DEFAULT_TIMEOUT: 15000,
    SHORT_TIMEOUT: 5000,

    // Number of retry attempts for failed requests
    MAX_RETRIES: 2,

    // Authentication settings
    AUTH: {
        TOKEN_STORAGE_KEY: 'token',
        ALT_TOKEN_STORAGE_KEY: 'access_token',
    },

    // Default service account
    SERVICE_ACCOUNT: {
        EMAIL: process.env.SERVICE_ACCOUNT_EMAIL || 'admin@example.com',
        PASSWORD: process.env.SERVICE_ACCOUNT_PASSWORD || 'admin123',
    }
};

/**
 * Get the appropriate base URL for API requests
 * Prioritizes Docker service name when in container
 */
export function getBaseApiUrl(): string {
    // For production, use environment variable if available
    if (process.env.NODE_ENV === 'production' && API_CONFIG.ENV_URL) {
        return API_CONFIG.ENV_URL;
    }

    // When running server-side in Next.js (SSR), always use the Docker service name
    if (typeof window === 'undefined') {
        return API_CONFIG.DOCKER_URL;
    }

    // Default to Docker URL inside container network
    return API_CONFIG.DOCKER_URL;
}

export default API_CONFIG; 