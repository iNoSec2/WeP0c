export function getBackendURL(): string {
    // Get the backend URL from environment variable or use a default
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';
} 