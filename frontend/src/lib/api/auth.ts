import apiClient from "./client";
import API_CONFIG from './config';
import axios from 'axios';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    password: string;
    email?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user_id: string;
    username: string;
    email: string;
    role: string;
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        try {
            // Login with the backend
            const formData = new FormData();
            formData.append("username", credentials.username);
            formData.append("password", credentials.password);

            const response = await apiClient.post<AuthResponse>("/api/auth/login", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    register: async (data: RegisterData): Promise<any> => {
        const response = await apiClient.post("/api/auth/register", data);
        return response.data;
    },

    createClient: async (data: RegisterData): Promise<any> => {
        const response = await apiClient.post("/api/auth/register/client", data);
        return response.data;
    },

    logout: (): void => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("user_data");
    },

    getCurrentUser: async (): Promise<any> => {
        try {
            const response = await apiClient.get("/api/auth/me");

            // Store user data in localStorage for easier access
            if (response.data) {
                localStorage.setItem("user_data", JSON.stringify(response.data));

                // Make sure the stored user object matches the User interface format
                const userObj = {
                    id: parseInt(response.data.id || response.data.user_id),
                    email: response.data.email,
                    full_name: response.data.full_name || response.data.username,
                    role: response.data.role.toLowerCase(),
                    is_active: true,
                    created_at: response.data.created_at || new Date().toISOString(),
                    updated_at: response.data.updated_at || new Date().toISOString()
                };
                localStorage.setItem("user", JSON.stringify(userObj));

                return userObj;
            }

            return response.data;
        } catch (error) {
            console.error("Error getting current user:", error);
            throw error;
        }
    },
};

/**
 * Get authentication token from browser storage
 * Checks both possible storage keys
 */
export function getToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Check the primary token storage key
    let token = localStorage.getItem(API_CONFIG.AUTH.TOKEN_STORAGE_KEY);

    // If not found, check the alternate key
    if (!token) {
        token = localStorage.getItem(API_CONFIG.AUTH.ALT_TOKEN_STORAGE_KEY);
    }

    return token;
}

/**
 * Set authentication token in browser storage
 * Stores in both locations for backward compatibility
 */
export function setToken(token: string): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(API_CONFIG.AUTH.TOKEN_STORAGE_KEY, token);
    localStorage.setItem(API_CONFIG.AUTH.ALT_TOKEN_STORAGE_KEY, token);

    // Also set in cookie for API routes
    setCookie(API_CONFIG.AUTH.TOKEN_STORAGE_KEY, token);
}

/**
 * Clear all authentication tokens from storage
 */
export function clearToken(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(API_CONFIG.AUTH.TOKEN_STORAGE_KEY);
    localStorage.removeItem(API_CONFIG.AUTH.ALT_TOKEN_STORAGE_KEY);

    // Also clear user data if stored
    localStorage.removeItem('user');
    localStorage.removeItem('user_data');

    // Clear cookie
    document.cookie = `${API_CONFIG.AUTH.TOKEN_STORAGE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return !!getToken();
}

/**
 * Set a cookie in the browser with proper encoding
 */
export function setCookie(name: string, value: string, days = 7): void {
    if (typeof window === 'undefined') return;

    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Get service account token for API operations
 * This is useful for NextJS API routes that need to call the backend
 */
export async function getServiceAccountToken(baseUrl?: string): Promise<string | null> {
    try {
        const url = `${baseUrl || API_CONFIG.DOCKER_URL}/api/auth/token`;

        const response = await axios.post(url,
            {
                username: API_CONFIG.SERVICE_ACCOUNT.EMAIL,
                password: API_CONFIG.SERVICE_ACCOUNT.PASSWORD
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        if (response.data?.access_token) {
            return response.data.access_token;
        }

        console.error('No token in service account response:', response.data);
        return null;
    } catch (error) {
        console.error('Failed to get service account token:', error);
        return null;
    }
}

/**
 * Simple logout function
 */
export function logout(): void {
    clearToken();

    // Redirect to login page
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
}