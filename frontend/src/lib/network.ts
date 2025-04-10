/**
 * Central networking configuration file
 * Optimized for Docker container networking
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosRequestHeaders } from 'axios';
import { getBackendURL } from '@/lib/api';

// Environment configuration constants
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const isServerSide = typeof window === 'undefined';

/**
 * Creates a configured axios instance for backend API calls
 * Optimized for Docker networking with direct service communication
 */
export function createApiClient(): AxiosInstance {
    const baseURL = getBackendURL(); // Always returns the Docker service URL

    const client = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        // Enable credentials for all requests
        withCredentials: true,
        // Disable proxy to avoid any proxy-related issues
        proxy: false,
        // Set reasonable timeout
        timeout: DEFAULT_TIMEOUT,
    });

    // Log the baseURL for debugging
    console.log(`API client initialized with Docker service URL: ${client.defaults.baseURL}`);

    // Add request interceptor for authentication
    client.interceptors.request.use(
        (config) => {
            // Add token from localStorage if available (client-side only)
            if (!isServerSide) {
                // Check for token in localStorage
                const token = localStorage.getItem('token') || localStorage.getItem('access_token');

                if (token) {
                    if (!config.headers) {
                        config.headers = {} as AxiosRequestHeaders;
                    }
                    config.headers.Authorization = `Bearer ${token}`;

                    // Add token as cookie for server components to access
                    document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=3600; SameSite=Strict`;

                    // Log token presence for debugging (don't log the actual token)
                    console.log('Adding auth token to request:', {
                        url: config.url,
                        hasToken: true
                    });
                } else {
                    console.log('No auth token found in localStorage for request:', config.url);
                }
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Add response interceptor for better error handling
    client.interceptors.response.use(
        (response) => response,
        (error) => {
            // Enhance error object with useful information
            if (error.code === 'ECONNREFUSED') {
                console.error('Connection refused error:', {
                    url: error.config?.url,
                    baseURL: error.config?.baseURL,
                    message: error.message
                });

                // Add custom properties to identify connection errors
                error.isConnectionError = true;
                error.friendlyMessage = 'Unable to connect to the API service. Check if all containers are running and the Docker network is functioning properly.';
            }

            // Special handling for authentication errors
            if (error.response?.status === 401) {
                console.error('Authentication error:', {
                    url: error.config?.url,
                    status: 401,
                    message: error.message
                });

                // Could trigger auth refresh here in the future
            }

            // Log details of the error for debugging
            console.error('API Error:', {
                url: error.config?.url,
                status: error.response?.status,
                message: error.message,
                details: error.response?.data
            });

            return Promise.reject(error);
        }
    );

    return client;
}

// Create the singleton API client instance
export const apiClient = createApiClient();

/**
 * Helper function to get authentication token
 */
export function getAuthToken(): string | null {
    if (isServerSide) return null;
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    return token;
}

/**
 * Special HTTP request function that handles network errors gracefully
 * Configured for Docker container networking
 */
export async function safeRequest<T>(
    config: AxiosRequestConfig,
    options: {
        fallback?: T,
        retries?: number,
        retryDelay?: number
    } = {}
): Promise<T> {
    const { fallback, retries = 2, retryDelay = 1000 } = options;
    let lastError: any;

    // Always ensure withCredentials is set
    if (!config.withCredentials) {
        config.withCredentials = true;
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await apiClient.request<T>(config);
            return response.data;
        } catch (error: any) {
            lastError = error;

            // Don't retry auth errors or bad requests
            if (error.response?.status === 401 || error.response?.status === 400) {
                break;
            }

            // Log connection errors with more details
            if (error.isConnectionError) {
                console.log(`API connection attempt ${attempt + 1}/${retries + 1} failed: ${error.message}`);
                console.log('Make sure all Docker containers are running and the Docker network is properly configured');
            }

            // Only retry connection errors or 5xx server errors
            if (error.isConnectionError || error.response?.status >= 500) {
                if (attempt < retries) {
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    continue;
                }
            }

            break;
        }
    }

    // All retries failed or error not retryable
    if (fallback !== undefined) {
        return fallback as T;
    }

    throw lastError;
} 