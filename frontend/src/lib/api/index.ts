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
            return 'http://p0cit-app:8001'; // Use container name in Docker environment
        }
        return apiUrl;
    }

    // For server-side calls (SSR) in Next.js, use the internal Docker network IP
    if (typeof window === 'undefined') {
        // Use IP address instead of hostname to prevent IPv6 resolution issues
        return "http://api:8001"; // Using the service name as defined in docker-compose
    }

    // For client-side (browser) calls, use the browser-visible address
    return "http://127.0.0.1:8001"; // Use explicit IPv4 instead of localhost
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