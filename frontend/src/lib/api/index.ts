// Re-export all API modules from a central location
import dashboardAPI from './dashboard';
import vulnerabilitiesAPI from './vulnerabilities';

// Re-export everything
export {
    dashboardAPI,
    vulnerabilitiesAPI
};

// For backwards compatibility with code that might be using these
export const getBackendURL = () => {
    // For production deployments, use the environment variable
    if (process.env.NODE_ENV === 'production') {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            console.warn('NEXT_PUBLIC_API_URL environment variable is not set in production mode');
            return 'http://api:8001'; // Use container name in Docker environment
        }
        return apiUrl;
    }

    // For server-side calls (SSR) in Next.js
    if (typeof window === 'undefined') {
        // Check if we're in a Docker/container environment
        if (process.env.CONTAINER_ENV === 'true') {
            // Use the service name defined in docker-compose
            return "http://api:8001";
        } else {
            // When running on host machine (not in container)
            return "http://127.0.0.1:8001"; // Explicit IPv4 address
        }
    }

    // For client-side (browser) calls
    // ALWAYS use explicit IPv4 address to avoid IPv6 issues
    // This prevents ECONNREFUSED errors with ::1 (IPv6 localhost)
    return "http://127.0.0.1:8001";
};

// Helper function to get the token from localStorage
export const getToken = () => {
    if (typeof window === 'undefined') return null;

    // Try to get token from localStorage (check both possible keys)
    let token = localStorage.getItem("token");
    if (!token) {
        token = localStorage.getItem("access_token");
    }
    return token;
}; 