import axios from "axios";
import { loginToBackend } from "./loginUtil";

// API base URL - use the backend service name in Docker
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://p0cit-app:8001";
console.log('Using API base URL:', API_BASE_URL);

// Create axios instance with defaults
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
    async (config) => {
        // Try to get token from local storage (check both possible keys)
        let token = localStorage.getItem("token");
        if (!token) {
            token = localStorage.getItem("access_token");
        }

        // If token exists, add to headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`Added auth token to request: ${config.method?.toUpperCase()} ${config.url}`);
        } else {
            console.log(`No auth token for request: ${config.method?.toUpperCase()} ${config.url}`);

            // For development: If no token is found, try to login
            // REMOVE THIS IN PRODUCTION
            if (process.env.NODE_ENV === 'development') {
                try {
                    console.log('No token found, attempting to login');
                    const authResponse = await loginToBackend();
                    token = authResponse.access_token;

                    if (token) {
                        // Use the token from login
                        config.headers.Authorization = `Bearer ${token}`;
                        console.log('Successfully logged in and added token to request');
                    }
                } catch (error) {
                    console.error('Failed to login automatically:', error);

                    // Fallback to default token if login fails
                    const defaultDevToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjOGE2MGFlYi01N2ViLTQ0MmUtOTA1MS1kNzY5ZGUyOTlhOWEiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJleHAiOjE3NDQxMjUxMzh9.0oQ3zlw4FCIVXodMg9C4TV2jtRG4JtQZ6bE8pC2ZTBA";

                    // Save it to localStorage for future use
                    localStorage.setItem('token', defaultDevToken);
                    localStorage.setItem('access_token', defaultDevToken);

                    // Create a user object with super_admin role
                    const userObj = {
                        id: 1,
                        email: 'admin@p0cit.com',
                        full_name: 'Super Admin',
                        role: 'super_admin',
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    localStorage.setItem('user', JSON.stringify(userObj));

                    // Use the default token
                    config.headers.Authorization = `Bearer ${defaultDevToken}`;
                    console.log('Using default development token as fallback');
                }
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.status, error.response?.data);

        if (error.response?.status === 401) {
            console.log('401 Unauthorized error - clearing tokens and redirecting to login');
            // Clear all auth tokens
            localStorage.removeItem("token");
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            localStorage.removeItem("user_data");

            // In development, don't redirect immediately to make debugging easier
            const isDev = process.env.NODE_ENV === 'development';
            if (!isDev) {
                window.location.href = "/login";
            } else {
                console.log('Development mode: not redirecting to login page automatically');

                // Try to login again in development mode
                try {
                    console.log('Attempting to login again after 401 error');
                    await loginToBackend();
                    console.log('Successfully logged in again');
                } catch (loginError) {
                    console.error('Failed to login after 401 error:', loginError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;