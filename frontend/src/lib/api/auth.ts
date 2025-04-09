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