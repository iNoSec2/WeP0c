export const getBackendURL = () => {
    // In browser environment, we need to use localhost
    if (typeof window !== 'undefined') {
        // Check if we're running in local development
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return "http://localhost:8001"; // Use localhost instead of container name
        }
    }

    // For SSR in Docker environment, use the container name
    // This is used when the Next.js server makes requests to the backend
    console.log('Using API base URL:', process.env.NEXT_PUBLIC_API_URL || "http://p0cit-app:8001");
    return process.env.NEXT_PUBLIC_API_URL || "http://p0cit-app:8001";
};