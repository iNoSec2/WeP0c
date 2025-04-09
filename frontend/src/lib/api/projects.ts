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
        try {
            const response = await apiClient.get("/api/projects");
            return response.data;
        } catch (error) {
            console.error("Error fetching projects:", error);
            return [];
        }
    },

    getProject: async (id: string): Promise<Project> => {
        try {
            const response = await apiClient.get(`/api/projects/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching project ${id}:`, error);
            // Return mock data for development to help with UI design
            if (process.env.NODE_ENV === 'development') {
                return {
                    id,
                    name: "Sample Project",
                    description: "This is a sample project description for development purposes. The actual project data could not be loaded.",
                    client_id: "sample-client-id",
                    status: "planning",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    start_date: new Date().toISOString(),
                    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    pentester_ids: ["sample-pentester-id"]
                };
            }
            throw error;
        }
    },

    createProject: async (data: CreateProjectData): Promise<Project> => {
        try {
            const response = await apiClient.post("/api/projects", data);
            return response.data;
        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    },

    updateProject: async (id: string, data: UpdateProjectData): Promise<Project> => {
        try {
            const response = await apiClient.patch(`/api/projects/${id}`, data);
            return response.data;
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
}; 