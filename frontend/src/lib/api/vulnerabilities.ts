import apiClient from "./client";

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

export interface Vulnerability {
    id: string;
    title: string;
    description_md: string;
    severity: SeverityLevel;
    cvss_score?: number;
    status: string;
    project_id: string;
    created_at: string;
    updated_at: string;
    reported_by: string;
    remediation_md?: string;
    proof_of_concept?: string;
    affected_asset?: string;
}

export interface CreateVulnerabilityData {
    title: string;
    description_md: string;
    severity: SeverityLevel;
    cvss_score?: number;
    status?: string;
    project_id: string;
    remediation_md?: string;
    proof_of_concept?: string;
    affected_asset?: string;
}

export interface UpdateVulnerabilityData {
    title?: string;
    description_md?: string;
    severity?: SeverityLevel;
    cvss_score?: number;
    status?: string;
    remediation_md?: string;
    proof_of_concept?: string;
    affected_asset?: string;
}

export const vulnerabilitiesService = {
    getVulnerabilities: async (projectId?: string): Promise<Vulnerability[]> => {
        const url = projectId ? `/projects/${projectId}/vulnerabilities` : "/vulnerabilities";
        const response = await apiClient.get(url);
        return response.data;
    },

    getVulnerability: async (id: string): Promise<Vulnerability> => {
        const response = await apiClient.get(`/vulnerabilities/${id}`);
        return response.data;
    },

    createVulnerability: async (data: CreateVulnerabilityData): Promise<Vulnerability> => {
        const response = await apiClient.post("/vulnerabilities", data);
        return response.data;
    },

    updateVulnerability: async (id: string, data: UpdateVulnerabilityData): Promise<Vulnerability> => {
        const response = await apiClient.patch(`/vulnerabilities/${id}`, data);
        return response.data;
    },

    deleteVulnerability: async (id: string): Promise<void> => {
        await apiClient.delete(`/vulnerabilities/${id}`);
    },
}; 