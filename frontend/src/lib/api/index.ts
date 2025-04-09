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

    // For server-side calls (SSR) in Next.js, use the explicit service name from docker-compose
    // This ensures consistent behavior across all server-side API calls
    if (typeof window === 'undefined') {
        return "http://api:8001";
    }

    // For client-side (browser) calls, use local address
    // This addresses IPv4/IPv6 compatibility issues and ensures connectivity
    return "http://localhost:8001";
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