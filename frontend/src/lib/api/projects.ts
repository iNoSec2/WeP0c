import apiClient from "./client";

export interface Project {
    id: string;
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    client_id: string;
    pentester_ids?: string[];
    status: string;
    created_at: string;
    updated_at: string;
}

export interface CreateProjectData {
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    client_id: string;
    pentester_ids?: string[];
}

export interface UpdateProjectData {
    name?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    pentester_ids?: string[];
    status?: string;
}

export const projectsService = {
    getProjects: async (): Promise<Project[]> => {
        const response = await apiClient.get("/projects");
        return response.data;
    },

    getProject: async (id: string): Promise<Project> => {
        const response = await apiClient.get(`/projects/${id}`);
        return response.data;
    },

    createProject: async (data: CreateProjectData): Promise<Project> => {
        const response = await apiClient.post("/projects", data);
        return response.data;
    },

    updateProject: async (id: string, data: UpdateProjectData): Promise<Project> => {
        const response = await apiClient.patch(`/projects/${id}`, data);
        return response.data;
    },

    deleteProject: async (id: string): Promise<void> => {
        await apiClient.delete(`/projects/${id}`);
    },
}; 