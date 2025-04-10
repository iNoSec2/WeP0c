import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { getBackendURL } from './index';
import { loginToBackend } from './loginUtil';

// Define a consistent API endpoint structure
const API_BASE_PATH = '/api';
const ADMIN_BASE_PATH = `${API_BASE_PATH}/admin`;

// Host configurations
const API_HOSTS = [
    'http://api:8001',          // Docker container name - highest priority in Docker environment
    'http://127.0.0.1:8001',    // Direct IPv4 - good for local development
    process.env.NEXT_PUBLIC_API_URL || '' // Environment variable fallback
];

// Extend AxiosRequestConfig to include our custom properties
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
    retryAuth?: boolean;
}

/**
 * AdminAPI client for making authenticated requests to admin endpoints
 */
export class AdminAPIClient {
    private token: string | null = null;
    private tokenPromise: Promise<string> | null = null;

    /**
     * Get authentication token, using serviceAccount if necessary
     */
    async getToken(forceRenew = false): Promise<string> {
        // Return existing token if available and not forcing renewal
        if (this.token && !forceRenew) {
            return this.token;
        }

        // If there's a pending token request, wait for it
        if (this.tokenPromise) {
            return this.tokenPromise;
        }

        // Create a new token request
        this.tokenPromise = this._fetchToken();

        try {
            // Wait for token and store it
            this.token = await this.tokenPromise;
            return this.token;
        } finally {
            // Clear promise after resolution
            this.tokenPromise = null;
        }
    }

    /**
     * Internal method to fetch a token using service account
     */
    private async _fetchToken(): Promise<string> {
        try {
            // Use environment variables for service account credentials
            const serviceEmail = process.env.SERVICE_ACCOUNT_EMAIL || 'admin@example.com';
            const servicePassword = process.env.SERVICE_ACCOUNT_PASSWORD || 'admin123';

            // Login to get a valid token
            const authResponse = await loginToBackend(serviceEmail, servicePassword);

            if (!authResponse?.access_token) {
                throw new Error('Failed to obtain token from backend');
            }

            console.log('Successfully obtained service token for admin operations');
            return authResponse.access_token;
        } catch (error) {
            console.error('Failed to obtain service token:', error);
            throw new Error('Authentication failed');
        }
    }

    /**
     * Make an API request with automatic token handling and host fallback
     */
    async request<T>(
        method: string,
        endpoint: string,
        data?: any,
        config?: ExtendedAxiosRequestConfig
    ): Promise<T> {
        const token = await this.getToken();

        // Enhanced configuration with authentication
        const finalConfig: ExtendedAxiosRequestConfig = {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            timeout: method.toLowerCase() === 'post' ? 8000 : 5000, // Longer timeout for POST requests
            ...config,
        };

        // Try hosts in priority order
        let lastError = null;

        for (const host of API_HOSTS.filter(Boolean)) {
            const url = `${host}${endpoint}`;

            try {
                console.log(`Making ${method} request to ${url}`);
                const response = await axios({
                    url,
                    data: data && method.toLowerCase() !== 'get' ? data : undefined,
                    params: method.toLowerCase() === 'get' ? data : undefined,
                    ...finalConfig,
                });

                console.log(`Request to ${url} successful`);
                return response.data;
            } catch (error: any) {
                console.log(`Request to ${url} failed: ${error.message}`);

                // Enhanced error logging
                if (error.response) {
                    console.log(`Status: ${error.response.status}, Data:`, error.response.data);

                    // Token expired, try to refresh and retry once
                    if (error.response.status === 401 && !config?.retryAuth) {
                        try {
                            console.log('Trying to refresh token and retry request');
                            const newToken = await this.getToken(true);

                            // Retry with new token (only once)
                            return this.request<T>(method, endpoint, data, {
                                ...config,
                                retryAuth: true,
                                headers: { ...config?.headers, 'Authorization': `Bearer ${newToken}` }
                            });
                        } catch (refreshError) {
                            console.error('Token refresh failed:', refreshError);
                        }
                    }
                }

                lastError = error;
            }
        }

        // All hosts failed
        const status = lastError?.response?.status || 500;
        const detail = lastError?.response?.data?.detail || 'Request failed';

        throw {
            status,
            message: detail,
            details: lastError?.response?.data,
            originalError: lastError
        };
    }

    // Convenience methods for different request types
    async get<T>(path: string, params?: any, config?: ExtendedAxiosRequestConfig): Promise<T> {
        return this.request<T>('GET', path, params, config);
    }

    async post<T>(path: string, data?: any, config?: ExtendedAxiosRequestConfig): Promise<T> {
        return this.request<T>('POST', path, data, config);
    }

    async put<T>(path: string, data?: any, config?: ExtendedAxiosRequestConfig): Promise<T> {
        return this.request<T>('PUT', path, data, config);
    }

    async patch<T>(path: string, data?: any, config?: ExtendedAxiosRequestConfig): Promise<T> {
        return this.request<T>('PATCH', path, data, config);
    }

    async delete<T>(path: string, config?: ExtendedAxiosRequestConfig): Promise<T> {
        return this.request<T>('DELETE', path, null, config);
    }

    // Specific admin endpoints
    async getUsers() {
        return this.get(`${ADMIN_BASE_PATH}/users`);
    }

    async getUser(userId: string) {
        return this.get(`${ADMIN_BASE_PATH}/user/${userId}`);
    }

    async createUser(userData: any) {
        return this.post(`${ADMIN_BASE_PATH}/user`, userData);
    }

    async updateUser(userId: string, userData: any) {
        return this.patch(`${ADMIN_BASE_PATH}/user/${userId}`, userData);
    }

    async deleteUser(userId: string) {
        return this.delete(`${ADMIN_BASE_PATH}/user/${userId}`);
    }

    async getProjects() {
        return this.get(`${ADMIN_BASE_PATH}/projects`);
    }

    async createProject(projectData: any) {
        return this.post(`${API_BASE_PATH}/projects`, projectData);
    }
}

// Create singleton instance for use throughout the app
export const adminClient = new AdminAPIClient(); 