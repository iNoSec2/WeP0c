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
        const formData = new FormData();
        formData.append("username", credentials.username);
        formData.append("password", credentials.password);

        const response = await apiClient.post<AuthResponse>("/api/auth/login", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
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
        localStorage.removeItem("user_data");
    },

    getCurrentUser: async (): Promise<any> => {
        const response = await apiClient.get("/api/auth/me");
        return response.data;
    },
}; 