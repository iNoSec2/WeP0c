import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, AxiosHeaders } from "axios";
import { getToken } from ".";

// Configuration interface for API service
interface ApiServiceConfig {
    baseURL: string;
    timeout?: number;
    defaultHeaders?: Record<string, string>;
}

// Standard API response wrapper
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: number;
        message: string;
        details?: any;
    };
}

// Type for API error responses
interface ApiErrorData {
    detail?: string;
    message?: string;
    error?: string;
}

/**
 * Centralized API Service for handling all backend requests
 * with consistent error handling, retries, and response transformation
 */
class ApiService {
    private client: AxiosInstance;
    private config: ApiServiceConfig;

    /**
     * Create a new API service instance
     */
    constructor(config: ApiServiceConfig) {
        this.config = config;

        // Initialize axios client with defaults
        this.client = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout || 10000,
            headers: {
                "Content-Type": "application/json",
                ...(config.defaultHeaders || {})
            }
        });

        // Setup interceptors
        this.setupInterceptors();
    }

    /**
     * Setup request and response interceptors
     */
    private setupInterceptors() {
        // Request interceptor for authentication and logging
        this.client.interceptors.request.use(
            (config) => {
                // Add auth token if available
                if (typeof window !== 'undefined') {
                    const token = getToken();
                    if (token) {
                        if (!config.headers) {
                            config.headers = new AxiosHeaders();
                        }
                        if (config.headers instanceof AxiosHeaders) {
                            config.headers.set('Authorization', `Bearer ${token}`);
                        } else {
                            // Fallback for non-AxiosHeaders objects
                            (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
                        }
                    }
                }

                // Log outgoing requests in development
                if (process.env.NODE_ENV === 'development') {
                    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
                }

                return config;
            },
            (error) => {
                console.error("Request error:", error);
                return Promise.reject(error);
            }
        );

        // Response interceptor for standardized error handling
        this.client.interceptors.response.use(
            (response) => {
                // Return original response for our methods to transform
                return response;
            },
            (error: AxiosError) => {
                // Let our methods handle the error transformation
                return Promise.reject(error);
            }
        );
    }

    /**
     * Transform API success responses to standard format
     */
    private transformResponse<T>(response: AxiosResponse): ApiResponse<T> {
        // Apply data transformations for known types
        const transformedData = this.applyDataTransformations(response.data);

        return {
            success: true,
            data: transformedData
        };
    }

    /**
     * Transform API errors to standard format
     */
    private transformError(error: AxiosError): ApiResponse<never> {
        // Standard error response
        const errorResponse: ApiResponse<never> = {
            success: false,
            error: {
                code: error.response?.status || 500,
                message: "An unexpected error occurred",
                details: error.response?.data
            }
        };

        // More specific error based on status and response
        if (error.response) {
            // Extract error message from common patterns
            const errorData = error.response.data as ApiErrorData;
            const detail = errorData?.detail ||
                errorData?.message ||
                errorData?.error ||
                error.message;

            errorResponse.error.message = typeof detail === 'string' ? detail : JSON.stringify(detail);

            // Handle specific error cases
            if (error.response.status === 401) {
                errorResponse.error.message = "Authentication required. Please log in again.";

                // In browser context, redirect to login
                if (typeof window !== 'undefined') {
                    console.warn('Unauthorized request - redirecting to login');
                    // Add small delay to allow error to be reported
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 100);
                }
            } else if (error.response.status === 403) {
                errorResponse.error.message = "You don't have permission to perform this action.";
            } else if (error.response.status === 404) {
                errorResponse.error.message = "The requested resource was not found.";
            } else if (error.response.status === 400) {
                // Check for common validation errors
                if (detail === 'Username already registered') {
                    errorResponse.error.message = "This username is already in use. Please choose another.";
                } else if (detail === 'Email already registered') {
                    errorResponse.error.message = "This email is already registered. Please use another email.";
                }
            }
        } else if (error.request) {
            // Network error - no response received
            errorResponse.error.message = "Network error. Please check your connection.";
            errorResponse.error.details = {
                type: "network_error",
                message: error.message
            };
        }

        // Log errors in development
        if (process.env.NODE_ENV === 'development') {
            console.error("API Error:", {
                url: error.config?.url,
                status: error.response?.status,
                message: errorResponse.error.message,
                details: errorResponse.error.details
            });
        }

        return errorResponse;
    }

    /**
     * Apply standard data transformations for known object types
     */
    private applyDataTransformations(data: any): any {
        // Handle arrays by mapping each item
        if (Array.isArray(data)) {
            return data.map(item => this.applyDataTransformations(item));
        }

        // Handle objects that might need transformation
        if (data && typeof data === 'object') {
            // Deep copy the object
            const transformedObj = { ...data };

            // Transform UUID fields to strings
            if (transformedObj.id) {
                transformedObj.id = String(transformedObj.id);
            }

            // Ensure required datetime fields
            if (transformedObj.updated_at === null || transformedObj.updated_at === undefined) {
                transformedObj.updated_at = transformedObj.created_at || new Date().toISOString();
            }

            return transformedObj;
        }

        // Return primitive values unchanged
        return data;
    }

    /**
     * Make a GET request
     */
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const response = await this.client.get<T>(url, config);
            return this.transformResponse<T>(response);
        } catch (error: any) {
            if (error.success === false) {
                return error as ApiResponse<never>;
            }
            return this.transformError(error);
        }
    }

    /**
     * Make a POST request
     */
    async post<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            // Ensure role is capitalized if present
            if (data && typeof data === 'object' && 'role' in data && data['role']) {
                const typedData = data as any;
                typedData.role = typeof typedData.role === 'string' ? typedData.role.toUpperCase() : typedData.role;
            }

            const response = await this.client.post<T>(url, data, config);
            return this.transformResponse<T>(response);
        } catch (error: any) {
            if (error.success === false) {
                return error as ApiResponse<never>;
            }
            return this.transformError(error);
        }
    }

    /**
     * Make a PUT request
     */
    async put<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const response = await this.client.put<T>(url, data, config);
            return this.transformResponse<T>(response);
        } catch (error: any) {
            if (error.success === false) {
                return error as ApiResponse<never>;
            }
            return this.transformError(error);
        }
    }

    /**
     * Make a PATCH request
     */
    async patch<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const response = await this.client.patch<T>(url, data, config);
            return this.transformResponse<T>(response);
        } catch (error: any) {
            if (error.success === false) {
                return error as ApiResponse<never>;
            }
            return this.transformError(error);
        }
    }

    /**
     * Make a DELETE request
     */
    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        try {
            const response = await this.client.delete<T>(url, config);
            return this.transformResponse<T>(response);
        } catch (error: any) {
            if (error.success === false) {
                return error as ApiResponse<never>;
            }
            return this.transformError(error);
        }
    }
}

// Create and export a default API service instance for the backend
const apiService = new ApiService({
    baseURL: 'http://api:8001', // Default to Docker container name
    timeout: 15000,
    defaultHeaders: {
        'Accept': 'application/json'
    }
});

export default apiService;