import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { getBackendURL, getToken } from ".";

// Define consistent API host configurations with fallbacks
// In Docker environment, only the container name works reliably
const API_HOSTS = [
    'http://api:8001',          // Docker container name - only reliable option in Docker
].filter(Boolean); // Remove empty strings

// Create a base axios instance for API requests
const apiClient = axios.create({
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // 10 second timeout
    baseURL: 'http://api:8001' // Always use the Docker service name
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

/**
 * Enhanced request function with better logging and error handling
 */
async function enhancedRequest<T = any>(
    config: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
    try {
        // For debugging
        console.log(`Making API request to: ${config.baseURL || 'http://api:8001'}${config.url}`);

        // Make the request with axios directly
        const response = await axios({
            ...config,
            baseURL: config.baseURL || 'http://api:8001' // Ensure baseURL is set
        });

        console.log(`API request successful: ${config.url}`);
        return response;
    } catch (error: any) {
        const errorMsg = error.message || 'Unknown error';
        console.warn(`API request to ${config.url} failed: ${errorMsg}`);

        // Log detailed error for debugging if available
        if (error.response) {
            console.warn(`Status: ${error.response.status}, Data:`, error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.warn('No response received from server. Connection issue?');
        }

        throw error;
    }
}

// Override the default request method with our enhanced version
const originalRequest = apiClient.request.bind(apiClient);
apiClient.request = function <T = any, R = AxiosResponse<T>, D = any>(
    config: AxiosRequestConfig<D>
): Promise<R> {
    return enhancedRequest(config) as Promise<R>;
};

export default apiClient;