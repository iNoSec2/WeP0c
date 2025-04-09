import apiClient from "./client";

export type UserRole = "client" | "pentester" | "super_admin";

export interface User {
    id: string;
    username: string;
    email?: string;
    role: UserRole;
    is_active: boolean;
}

export interface PentesterUser extends User {
    specialities: string[];
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
    getPentesters: async (): Promise<PentesterUser[]> => {
        const response = await apiClient.get("/users/pentesters");
        return response.data;
    },

    getClients: async (): Promise<User[]> => {
        const response = await apiClient.get("/users/clients");
        return response.data;
    },

    createClient: async (data: CreateClientData): Promise<User> => {
        const response = await apiClient.post("/users/clients", data);
        return response.data;
    },

    createPentester: async (data: CreatePentesterData): Promise<PentesterUser> => {
        const response = await apiClient.post("/users/pentesters", data);
        return response.data;
    },

    addSpeciality: async (userId: string, speciality: string): Promise<PentesterUser> => {
        const response = await apiClient.post(`/users/specialities/${userId}/${speciality}`);
        return response.data;
    },

    removeSpeciality: async (userId: string, speciality: string): Promise<PentesterUser> => {
        const response = await apiClient.delete(`/users/specialities/${userId}/${speciality}`);
        return response.data;
    },
}; 