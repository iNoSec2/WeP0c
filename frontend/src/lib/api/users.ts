import apiClient from "./client";
import { serializeUserFromBackend, serializeUsersFromBackend, serializeUserToBackend } from "./serializers";
import { userRoutes } from "./routes";

export type UserRole = "client" | "pentester" | "super_admin" | "admin" | "user";

export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    is_active?: boolean;
    full_name?: string;
    company?: string;
    specialities?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface PentesterUser extends User {
    specialities: string[];
}

export interface CreateUserData {
    username: string;
    email: string;
    password: string;
    role: string;
}

export interface UpdateUserData {
    username?: string;
    email?: string;
    password?: string;
    role?: string;
}

export interface CreateClientData {
    username: string;
    password: string;
    email?: string;
}

export interface CreatePentesterData {
    username: string;
    password: string;
    email?: string;
    specialities?: string[];
}

export const usersService = {
    getUsers: async (): Promise<User[]> => {
        try {
            const response = await apiClient.get("/api/users", {
                headers: {
                    'Cache-Control': 'no-cache'
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    },

    getAdminUsers: async (): Promise<User[]> => {
        try {
            const response = await apiClient.get("/api/users", {
                headers: {
                    'Cache-Control': 'no-cache'
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching admin users:", error);
            return [];
        }
    },

    getUser: async (id: string): Promise<User> => {
        try {
            const response = await apiClient.get(`/api/users/${id}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
            throw error;
        }
    },

    createUser: async (data: CreateUserData): Promise<User> => {
        try {
            const backendData = serializeUserToBackend(data);
            const response = await apiClient.post("/api/users", backendData, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    },

    updateUser: async (id: string, data: UpdateUserData): Promise<User> => {
        try {
            const backendData = serializeUserToBackend({
                id,
                ...data
            });
            const response = await apiClient.put(`/api/users/${id}`, backendData, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating user ${id}:`, error);
            throw error;
        }
    },

    deleteUser: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/api/users/${id}`, {
                withCredentials: true
            });
        } catch (error) {
            console.error(`Error deleting user ${id}:`, error);
            throw error;
        }
    },

    getPentesters: async (): Promise<PentesterUser[]> => {
        try {
            const response = await apiClient.get("/api/users/pentesters", {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching pentesters:", error);
            return [];
        }
    },

    getClients: async (): Promise<User[]> => {
        try {
            const response = await apiClient.get("/api/users?role=client", {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching clients:", error);
            return [];
        }
    },

    createClient: async (data: CreateClientData): Promise<User> => {
        try {
            const response = await apiClient.post("/api/users/clients", data, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Error creating client:", error);
            throw error;
        }
    },

    createPentester: async (data: CreatePentesterData): Promise<PentesterUser> => {
        try {
            const response = await apiClient.post("/api/users/pentesters", data, {
                withCredentials: true
            });
            return response.data as PentesterUser;
        } catch (error) {
            console.error("Error creating pentester:", error);
            throw error;
        }
    },

    addSpeciality: async (userId: string, speciality: string): Promise<PentesterUser> => {
        try {
            const response = await apiClient.post(`/api/users/specialities/${userId}/${speciality}`, {}, {
                withCredentials: true
            });
            return response.data as PentesterUser;
        } catch (error) {
            console.error(`Error adding speciality for user ${userId}:`, error);
            throw error;
        }
    },

    removeSpeciality: async (userId: string, speciality: string): Promise<PentesterUser> => {
        try {
            const response = await apiClient.delete(`/api/users/specialities/${userId}/${speciality}`, {
                withCredentials: true
            });
            return response.data as PentesterUser;
        } catch (error) {
            console.error(`Error removing speciality for user ${userId}:`, error);
            throw error;
        }
    },
}; 