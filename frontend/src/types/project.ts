export enum ProjectStatus {
    PLANNING = "planning",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}

export interface Project {
    id: string;
    name: string;
    client_id: string;
    status: ProjectStatus;
    created_at: string;
    updated_at: string;
    client?: {
        id: string;
        username: string;
        email?: string;
    };
    pentesters: Array<{
        id: string;
        username: string;
        email?: string;
    }>;
    vulnerabilities: Array<{
        id: string;
        title: string;
        severity: string;
        status: string;
    }>;
} 