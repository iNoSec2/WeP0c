import apiClient from "./client";
import { serializeProjectFromBackend, serializeProjectsFromBackend, serializeProjectToBackend } from "./serializers";

export interface Project {
    id: string;
    name: string;
    description?: string;
    start_date?: string | null;
    end_date?: string | null;
    client_id: string;
    client?: {
        id: string;
        username: string;
        email?: string;
    };
    status?: string;
    created_at?: string;
    updated_at?: string;
    pentester_ids?: string[];
    pentesters: Array<{ id: string; username: string; email?: string }>;
    vulnerabilities: Array<{ id: string; title: string; severity: string; status: string }>;
}

export interface CreateProjectData {
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    client_id: string;
    pentester_id?: string;
    pentester_ids?: string[];
    status?: string;
}

export interface UpdateProjectData {
    name?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    pentester_ids?: string[];
    status?: string;
}

/**
 * Functions for fetching and managing pentesters
 */
export const pentesterService = {
    /**
     * Get all available pentesters for assignment
     */
    getAvailablePentesters: async (): Promise<Array<{ id: string; username: string; email: string }>> => {
        try {
            const response = await apiClient.get("/api/users?role=pentester");
            return response.data.map(user => ({
                id: user.id,
                username: user.username || user.email,
                email: user.email
            }));
        } catch (error) {
            console.error("Error fetching pentesters:", error);
            return [];
        }
    }
};

export const projectsService = {
    getProjects: async (): Promise<Project[]> => {
        try {
            const response = await apiClient.get("/api/projects");
            return serializeProjectsFromBackend(response.data);
        } catch (error) {
            console.error("Error fetching projects:", error);
            return [];
        }
    },

    getAdminProjects: async (): Promise<Project[]> => {
        try {
            const response = await apiClient.get("/api/admin/projects");
            return serializeProjectsFromBackend(response.data);
        } catch (error) {
            console.error("Error fetching admin projects:", error);
            return [];
        }
    },

    getProject: async (id: string): Promise<Project> => {
        try {
            const response = await apiClient.get(`/api/projects/${id}`);
            return serializeProjectFromBackend(response.data);
        } catch (error) {
            console.error(`Error fetching project ${id}:`, error);
            throw error;
        }
    },

    createProject: async (data: CreateProjectData): Promise<Project> => {
        try {
            const backendData = serializeProjectToBackend(data);
            const response = await apiClient.post("/api/projects", backendData);
            return serializeProjectFromBackend(response.data);
        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    },

    updateProject: async (id: string, data: UpdateProjectData): Promise<Project> => {
        try {
            const backendData = serializeProjectToBackend({
                id,
                ...data
            });
            const response = await apiClient.put(`/api/projects/${id}`, backendData);
            return serializeProjectFromBackend(response.data);
        } catch (error) {
            console.error(`Error updating project ${id}:`, error);
            throw error;
        }
    },

    deleteProject: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/api/projects/${id}`);
        } catch (error) {
            console.error(`Error deleting project ${id}:`, error);
            throw error;
        }
    },

    /**
     * Assign pentesters to a project
     */
    assignPentesters: async (projectId: string, pentesterIds: string[]): Promise<Project> => {
        try {
            const response = await apiClient.post(`/api/projects/${projectId}/assign-pentesters`, {
                pentester_ids: pentesterIds
            });
            return serializeProjectFromBackend(response.data);
        } catch (error) {
            console.error(`Error assigning pentesters to project ${projectId}:`, error);
            throw error;
        }
    }
};