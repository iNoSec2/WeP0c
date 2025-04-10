import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { getBackendURL, getToken } from "./index";

// Define consistent API host configurations with fallbacks
// In Docker environment, only the container name works reliably
const API_HOSTS = [
    'http://api:8001',          // Docker container name - only reliable option in Docker
].filter(Boolean); // Remove empty strings

// Create an axios instance with custom configuration
const apiClient = axios.create({
    baseURL: getBackendURL().replace('localhost', '127.0.0.1'), // Force IPv4 address
    headers: {
        "Content-Type": "application/json",
    },
    // Disable proxies to avoid issues
    proxy: false,
    // Set timeout to 10 seconds
    timeout: 10000,
});

// Initialize auth headers from localStorage if token exists (client-side only)
if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
}

// Add a request interceptor to add auth token to each request
apiClient.interceptors.request.use(
    (config) => {
        // Add token from localStorage if available
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Modify hostname to ensure IPv4 is used
        if (config.baseURL && config.baseURL.includes('localhost')) {
            config.baseURL = config.baseURL.replace('localhost', '127.0.0.1');
        }

        if (config.url && config.url.includes('localhost')) {
            config.url = config.url.replace('localhost', '127.0.0.1');
        }

        // Force IPv4 usage via Host header
        const baseUrl = config.baseURL || '';
        config.headers.Host = baseUrl.replace(/^https?:\/\//, '').split(':')[0];

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for better error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle connection errors with better messages
        if (error.code === 'ECONNREFUSED') {
            console.error('Connection refused error:', {
                message: error.message,
                url: error.config?.url,
                baseURL: error.config?.baseURL
            });
            error.isConnectionError = true;
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