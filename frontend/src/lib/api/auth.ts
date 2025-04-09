import apiClient from "./client";

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
            // Try to login with the backend
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

            // For demo purposes, return a mock token
            if (process.env.NODE_ENV === 'development') {
                console.log('Development mode: returning mock token');

                // Create a default token for development
                const defaultToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjOGE2MGFlYi01N2ViLTQ0MmUtOTA1MS1kNzY5ZGUyOTlhOWEiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJleHAiOjE3NDQxMjUxMzh9.0oQ3zlw4FCIVXodMg9C4TV2jtRG4JtQZ6bE8pC2ZTBA";

                // Store the token for future use
                localStorage.setItem('token', defaultToken);
                localStorage.setItem('access_token', defaultToken);

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

                return {
                    access_token: defaultToken,
                    token_type: 'bearer',
                    user_id: '1',
                    username: 'Super Admin',
                    email: 'admin@p0cit.com',
                    role: 'SUPER_ADMIN'
                };
            }

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
            // For demo purposes, check if we have a user in localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                console.log('Using stored user data');
                return JSON.parse(storedUser);
            }

            // If no stored user, try to get from backend
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
            } catch (backendError) {
                console.error("Error getting user from backend:", backendError);

                // For demo purposes, create a default super admin user
                if (process.env.NODE_ENV === 'development') {
                    console.log('Creating default super admin user for demo');

                    const defaultUser = {
                        id: 1,
                        email: 'admin@p0cit.com',
                        full_name: 'Super Admin',
                        role: 'super_admin',
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };

                    // Store in localStorage
                    localStorage.setItem('user', JSON.stringify(defaultUser));

                    return defaultUser;
                }

                throw backendError;
            }
        } catch (error) {
            console.error("Error getting current user:", error);
            throw error;
        }
    },
};