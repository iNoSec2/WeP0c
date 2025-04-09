import axios from "axios";
import { getBackendURL, getToken } from ".";

// Create a base axios instance for API requests
const apiClient = axios.create({
    // Don't set baseURL here as it's evaluated once at import time
    headers: {
        "Content-Type": "application/json",
    },
});

// Initialize auth headers from localStorage if token exists (client-side only)
if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
}

// Add request interceptor to attach auth token to all requests
apiClient.interceptors.request.use(
    (config) => {
        // Set the baseURL dynamically on each request
        config.baseURL = getBackendURL();

        // For SSR, we can't access localStorage so we skip token injection
        if (typeof window === 'undefined') {
            return config;
        }

        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('API Client Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle specific error cases (like 401, 403, etc)
        if (error.response) {
            // The request was made and the server responded with a status code
            // outside of the range of 2xx
            if (error.response.status === 401) {
                console.warn('Unauthorized request - redirecting to login');
                // Handle unauthorized (e.g., redirect to login)
                if (typeof window !== 'undefined') {
                    // Only redirect in browser context
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;