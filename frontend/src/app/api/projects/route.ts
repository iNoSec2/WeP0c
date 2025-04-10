import { NextResponse } from 'next/server';
import { apiClient, safeRequest } from '@/lib/network';
import { getBackendURL, getBackendURLs } from '@/lib/api';
import { loginToBackend } from '@/lib/api/loginUtil';
import { projectRoutes } from '@/lib/api/routes';
import { serializeProjectFromBackend, serializeProjectsFromBackend, isValidUUID as validateUUID } from '@/lib/api/serializers';

// Helper function to get token from request
const getTokenFromRequest = (request: Request) => {
    const cookies = request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    // Also check Authorization header as fallback
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.split(' ')[1];

    // Use token from cookie or header
    return token || headerToken;
};

// Helper function to extract user ID from JWT token
const extractUserIdFromToken = (token: string): string | null => {
    if (!token) return null;

    try {
        // Decode the JWT token payload (middle part)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const payload = JSON.parse(jsonPayload);
        return payload.sub || null; // 'sub' claim contains the user ID
    } catch (e) {
        console.error('Failed to decode token:', e);
        return null;
    }
};

// Helper function to extract user role and ID from token
const extractUserInfoFromToken = (token: string): { userRole: string, userId: string | null } => {
    if (!token) return { userRole: '', userId: null };

    try {
        // Decode the JWT token payload (middle part)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const payload = JSON.parse(jsonPayload);
        return {
            userId: payload.sub || null,
            userRole: payload.role || 'USER'
        };
    } catch (e) {
        console.error('Failed to decode token:', e);
        return { userRole: '', userId: null };
    }
};

export async function GET(request: Request) {
    try {
        // Get URL parameters
        const url = new URL(request.url);
        const skip = url.searchParams.get('skip') || '0';
        const limit = url.searchParams.get('limit') || '100';

        // Get token from request
        const finalToken = getTokenFromRequest(request);

        if (!finalToken) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        // Define request options
        const requestOpts = {
            headers: {
                Authorization: `Bearer ${finalToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 8000
        };

        try {
            // Use centralized routes for consistent API access
            const projectsEndpoint = `${projectRoutes.base}?skip=${skip}&limit=${limit}`;
            console.log(`Fetching projects from: ${projectsEndpoint}`);

            // Use safeRequest with retry capability
            const data = await safeRequest<any[]>({
                url: projectsEndpoint,
                method: 'GET',
                ...requestOpts
            }, {
                retries: 3,
                retryDelay: 1000
            });

            // Serialize backend projects to frontend format
            const serializedProjects = serializeProjectsFromBackend(data);

            // Fetch clients to populate project data with client details
            try {
                const clientsResponse = await safeRequest<any[]>({
                    url: '/api/users?role=client',
                    method: 'GET',
                    ...requestOpts
                }, {
                    retries: 2
                });

                // Create a map of client IDs to client objects
                const clientMap = {};
                clientsResponse.forEach(client => {
                    if (client && client.id) {
                        clientMap[client.id] = {
                            id: client.id,
                            username: client.username || 'Unknown',
                            email: client.email
                        };
                    }
                });

                // Enhance project data with client information
                const enhancedProjects = serializedProjects.map(project => ({
                    ...project,
                    client: clientMap[project.client_id] || null
                }));

                console.log(`Enhanced ${enhancedProjects.length} projects with client information`);
                return NextResponse.json(enhancedProjects);
            } catch (clientError) {
                console.warn('Failed to fetch client details, returning projects without client info:', clientError.message);
                // Return projects without client enhancement if client fetch fails
                return NextResponse.json(serializedProjects);
            }
        } catch (error: any) {
            console.error('Error fetching projects:', error);

            // Special case for connection errors
            if (error.isConnectionError) {
                return NextResponse.json(
                    {
                        error: error.friendlyMessage || 'Failed to connect to backend service',
                        details: error.message,
                        suggestion: 'Please check if the backend API service is running and accessible'
                    },
                    { status: 503 }
                );
            }

            // Handle other error types
            const status = error.response?.status || 500;
            const message = error.response?.data?.error ||
                error.response?.data?.detail ||
                'Failed to fetch projects';

            return NextResponse.json({ error: message }, { status });
        }
    } catch (error: any) {
        console.error('Error in projects endpoint:', error);

        // Return proper error response
        return NextResponse.json(
            { error: 'Failed to process request', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // Get token from request
        let finalToken = getTokenFromRequest(request);

        // If no token is available, try to login with service account
        if (!finalToken) {
            try {
                // Use environment variables for service account credentials
                const serviceEmail = process.env.SERVICE_ACCOUNT_EMAIL || 'admin@example.com';
                const servicePassword = process.env.SERVICE_ACCOUNT_PASSWORD || 'admin123';

                // Login to get a valid token
                const authResponse = await loginToBackend(serviceEmail, servicePassword);
                finalToken = authResponse.access_token;

                console.log('Successfully obtained service token for project creation');
            } catch (loginError) {
                console.error('Failed to obtain service token:', loginError);
                return NextResponse.json(
                    { error: 'Authentication failed' },
                    { status: 401 }
                );
            }
        }

        if (!finalToken) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        // Parse the request body
        const body = await request.json();
        console.log('Creating project:', body);

        // Check for client_id - needs to be a valid UUID
        if (!body.client_id || !validateUUID(body.client_id)) {
            console.warn('Invalid client_id provided:', body.client_id);

            // Return helpful error for invalid client_id
            return NextResponse.json(
                { error: 'Invalid client_id. Must be a valid UUID.' },
                { status: 400 }
            );
        }

        console.log('Sending project data to backend:', body);

        try {
            // Extract user role and ID from token
            const { userRole, userId } = extractUserInfoFromToken(finalToken);

            // For backend compatibility, ensure pentester_id exists
            // If pentester_ids array is provided but not pentester_id, use the first one as pentester_id
            if (body.pentester_ids && body.pentester_ids.length > 0 && !body.pentester_id) {
                console.log('Setting pentester_id from pentester_ids array:', body.pentester_ids[0]);
                body.pentester_id = body.pentester_ids[0];
            }

            // The backend API requires pentester_id (not pentester_ids)
            // We'll keep pentester_ids for frontend use but ensure pentester_id is set for backend

            // Admin-specific handling
            if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
                // Admin users can assign pentesters directly
                if (!body.pentester_id) {
                    console.log('Admin creating project without specifying pentester_id');
                }

                // Add admin context for backend permissions
                body.created_by = userId;
                body.admin_created = true;
            }
            // Pentester-specific handling
            else if (userRole === 'PENTESTER') {
                // For pentesters creating their own projects, assign self as pentester
                if (!body.pentester_id) {
                    console.log('Pentester creating project, assigning self as pentester:', userId);
                    body.pentester_id = userId;
                }
                body.created_by = userId;
            }
            // Client-specific handling or default
            else {
                body.created_by = userId;
            }

            console.log('Prepared project data:', {
                userRole,
                pentester_id: body.pentester_id,
                created_by: body.created_by
            });

            // Use centralized routes and safeRequest for consistent API access
            const data = await safeRequest<any>({
                url: projectRoutes.base,
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${finalToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                data: body,
                timeout: 10000
            }, {
                retries: 2,
                retryDelay: 1000
            });

            // Serialize backend response to frontend format
            const serializedProject = serializeProjectFromBackend(data);

            return NextResponse.json(serializedProject, { status: 201 });
        } catch (error: any) {
            console.error('Backend error during project creation:', error.message);

            // Special case for connection errors
            if (error.isConnectionError) {
                return NextResponse.json(
                    {
                        error: error.friendlyMessage || 'Failed to connect to backend service',
                        details: error.message,
                        suggestion: 'Please check if the backend API service is running and accessible'
                    },
                    { status: 503 }
                );
            }

            // Handle other error types
            const status = error.response?.status || 500;
            const message = error.response?.data?.error ||
                error.response?.data?.detail ||
                'Failed to create project';

            return NextResponse.json(
                { error: message, details: error.response?.data },
                { status }
            );
        }
    } catch (error: any) {
        console.error('Error in project creation process:', error);

        // Return proper error response
        return NextResponse.json(
            { error: 'Failed to process project creation request', details: error.message },
            { status: 500 }
        );
    }
}
