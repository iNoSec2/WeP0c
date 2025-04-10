/**
 * Serializers for converting between frontend and backend data models
 * Handles type conversions and data normalization
 */

import { Project } from "./projects";
import { User } from "./users";

// Backend project model (as expected by the API)
export interface BackendProject {
    id: number | string;
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    client_id: number | string;
    pentester_ids?: (number | string)[];
    status: string;
    created_at: string;
    updated_at: string | null;
}

// Backend user model (as expected by the API)
export interface BackendUser {
    id: string | number;
    username: string;
    email: string;
    role: string;
    is_active?: boolean;
    full_name?: string;
    company?: string;
    specialities?: string[];
    created_at: string;
    updated_at: string | null;
}

/**
 * Ensures a value is represented as a string
 */
export function ensureString(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value);
}

/**
 * Checks if a string represents a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') return false;

    // Standard UUID format with dashes
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(uuid)) return true;

    // UUID without dashes
    const uuidWithoutDashesRegex = /^[0-9a-f]{32}$/i;
    if (uuidWithoutDashesRegex.test(uuid)) return true;

    return false;
}

/**
 * Convert a backend project model to frontend model
 */
export function serializeProjectFromBackend(backendProject: any): Project {
    if (!backendProject) {
        console.warn('Empty project data received from backend');
        return {
            id: '',
            name: '',
            description: '',
            client_id: '',
            client: null,
            status: 'planning',
            start_date: null,
            end_date: null,
            pentester_ids: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    return {
        id: ensureString(backendProject.id),
        name: backendProject.name || '',
        description: backendProject.description || '',
        client_id: ensureString(backendProject.client_id),
        client: backendProject.client || null,
        status: backendProject.status || 'planning',
        start_date: backendProject.start_date || null,
        end_date: backendProject.end_date || null,
        pentester_ids: Array.isArray(backendProject.pentester_ids)
            ? backendProject.pentester_ids.map(id => ensureString(id))
            : [],
        created_at: backendProject.created_at || new Date().toISOString(),
        updated_at: backendProject.updated_at || new Date().toISOString()
    };
}

/**
 * Convert an array of backend projects to frontend models
 */
export function serializeProjectsFromBackend(backendProjects: any[]): Project[] {
    if (!Array.isArray(backendProjects)) {
        console.error('Expected array of projects but got:', typeof backendProjects);
        return [];
    }

    return backendProjects.map(project => serializeProjectFromBackend(project));
}

/**
 * Convert frontend project model to backend model for creation/updates
 */
export function serializeProjectToBackend(project: Partial<Project>): any {
    const result: any = {
        ...project
    };

    // Convert id from string to number if it looks like a number
    if (project.id && !isNaN(Number(project.id)) && !isValidUUID(project.id)) {
        result.id = Number(project.id);
    } else if (!project.id) {
        // For creation, remove id to let backend generate it
        delete result.id;
    }

    // Convert client_id to appropriate format if needed
    if (result.client_id && !isNaN(Number(result.client_id))) {
        // If the backend expects numeric IDs, convert string to number
        // Otherwise keep as string (UUID format)
        if (!isValidUUID(result.client_id)) {
            result.client_id = Number(result.client_id);
        }
    }

    // Handle pentester_id in the same way if present
    if (result.pentester_id && !isNaN(Number(result.pentester_id))) {
        if (!isValidUUID(result.pentester_id)) {
            result.pentester_id = Number(result.pentester_id);
        }
    }

    // Ensure pentester_id is passed to backend if available
    // This is required by the backend API
    if (!result.pentester_id && result.pentester_ids && result.pentester_ids.length > 0) {
        result.pentester_id = result.pentester_ids[0];
    }

    // Remove client nested object as backend doesn't expect it
    delete result.client;

    // Remove other frontend-only fields
    delete result.pentesters;

    // For backend compatibility:
    // Convert dates to ISO string format if they're Date objects
    if (result.start_date instanceof Date) {
        result.start_date = result.start_date.toISOString().split('T')[0];
    }

    if (result.end_date instanceof Date) {
        result.end_date = result.end_date.toISOString().split('T')[0];
    }

    return result;
}

/**
 * Convert a backend user model to frontend model
 */
export function serializeUserFromBackend(backendUser: any): User {
    if (!backendUser) {
        console.error('Expected user object but got:', backendUser);
        return {
            id: '',
            username: '',
            email: '',
            role: '',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: null
        };
    }

    // Ensure ID is always a string in frontend
    const userId = ensureString(backendUser.id);

    // Normalize role to lowercase for consistency
    const role = backendUser.role?.toLowerCase() || '';

    return {
        id: userId,
        username: backendUser.username || '',
        email: backendUser.email || '',
        role: role,
        is_active: backendUser.is_active !== undefined ? !!backendUser.is_active : true,
        full_name: backendUser.full_name || '',
        company: backendUser.company || '',
        specialities: Array.isArray(backendUser.specialities) ? backendUser.specialities : [],
        created_at: backendUser.created_at || new Date().toISOString(),
        updated_at: backendUser.updated_at || null,
    };
}

/**
 * Convert an array of backend users to frontend models
 */
export function serializeUsersFromBackend(backendUsers: any[]): User[] {
    if (!Array.isArray(backendUsers)) {
        console.error('Expected array of users but got:', typeof backendUsers);
        return [];
    }

    return backendUsers.map(user => serializeUserFromBackend(user));
}

/**
 * Convert frontend user model to backend model for creation/updates
 */
export function serializeUserToBackend(user: Partial<User>): any {
    const result: any = {
        ...user
    };

    // Handle ID format based on UUID vs numeric format
    if (user.id) {
        if (isValidUUID(user.id)) {
            // Keep UUID as string
            result.id = user.id;
        } else if (!isNaN(Number(user.id))) {
            // Convert string number to actual number if that's what backend expects
            result.id = Number(user.id);
        }
    } else {
        // For creation, remove id to let backend generate it
        delete result.id;
    }

    return result;
} 