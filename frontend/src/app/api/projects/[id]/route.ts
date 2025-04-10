import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { loginToBackend } from '@/lib/api/loginUtil';
import { serializeProjectFromBackend } from '@/lib/api/serializers';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const projectId = params.id;

        // Get token from cookies
        const cookies = request.headers.get('cookie') || '';
        const tokenMatch = cookies.match(/token=([^;]+)/);
        const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

        // Also check Authorization header as fallback
        const authHeader = request.headers.get('Authorization');
        const headerToken = authHeader?.split(' ')[1];

        // Use token from cookie or header
        let finalToken = token || headerToken;

        // If no token is available, try to login with service account
        if (!finalToken) {
            try {
                // Use environment variables for service account credentials
                const serviceEmail = process.env.SERVICE_ACCOUNT_EMAIL || 'admin@example.com';
                const servicePassword = process.env.SERVICE_ACCOUNT_PASSWORD || 'admin123';

                // Login to get a valid token
                const authResponse = await loginToBackend(serviceEmail, servicePassword);
                finalToken = authResponse.access_token;

                console.log('Successfully obtained service token for project details');
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

        // Forward request to backend
        const backendURL = getBackendURL();
        console.log(`Fetching project details from: ${backendURL}/api/projects/${projectId}`);

        const response = await axios.get(`${backendURL}/api/projects/${projectId}`, {
            headers: {
                Authorization: `Bearer ${finalToken}`
            }
        });

        // Get the project data and serialize to frontend format
        const projectData = serializeProjectFromBackend(response.data);

        // If project has client_id, fetch client details to enhance the response
        if (projectData.client_id) {
            try {
                // Make a request to get client information
                const clientResponse = await axios.get(`${backendURL}/api/users/${projectData.client_id}`, {
                    headers: {
                        Authorization: `Bearer ${finalToken}`
                    }
                });

                // Enhance project with client information
                projectData.client = {
                    id: clientResponse.data.id,
                    username: clientResponse.data.username || 'Unknown',
                    email: clientResponse.data.email
                };
            } catch (clientError) {
                console.warn(`Failed to fetch client details for project ${projectId}:`, clientError.message);
                // Continue without client enhancement if fetch fails
            }
        }

        return NextResponse.json(projectData);
    } catch (error: any) {
        console.error('Error fetching project details:', error);

        // Return proper error response
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || 'Failed to fetch project details';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const projectId = params.id;

        // Get token from cookies
        const cookies = request.headers.get('cookie') || '';
        const tokenMatch = cookies.match(/token=([^;]+)/);
        const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

        // Also check Authorization header as fallback
        const authHeader = request.headers.get('Authorization');
        const headerToken = authHeader?.split(' ')[1];

        // Use token from cookie or header
        let finalToken = token || headerToken;

        // If no token is available, try to login with service account
        if (!finalToken) {
            try {
                // Use environment variables for service account credentials
                const serviceEmail = process.env.SERVICE_ACCOUNT_EMAIL || 'admin@example.com';
                const servicePassword = process.env.SERVICE_ACCOUNT_PASSWORD || 'admin123';

                // Login to get a valid token
                const authResponse = await loginToBackend(serviceEmail, servicePassword);
                finalToken = authResponse.access_token;

                console.log('Successfully obtained service token for project update');
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

        // Forward request to backend
        const backendURL = getBackendURL();
        console.log(`Updating project: ${projectId}`, body);

        const response = await axios.patch(`${backendURL}/api/projects/${projectId}`, body, {
            headers: {
                Authorization: `Bearer ${finalToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Serialize response to frontend format
        const serializedProject = serializeProjectFromBackend(response.data);

        return NextResponse.json(serializedProject);
    } catch (error: any) {
        console.error('Error updating project:', error);

        // Return proper error response
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || 'Failed to update project';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const projectId = params.id;

        // Get token from cookies
        const cookies = request.headers.get('cookie') || '';
        const tokenMatch = cookies.match(/token=([^;]+)/);
        const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

        // Also check Authorization header as fallback
        const authHeader = request.headers.get('Authorization');
        const headerToken = authHeader?.split(' ')[1];

        // Use token from cookie or header
        let finalToken = token || headerToken;

        // If no token is available, try to login with service account
        if (!finalToken) {
            try {
                // Use environment variables for service account credentials
                const serviceEmail = process.env.SERVICE_ACCOUNT_EMAIL || 'admin@example.com';
                const servicePassword = process.env.SERVICE_ACCOUNT_PASSWORD || 'admin123';

                // Login to get a valid token
                const authResponse = await loginToBackend(serviceEmail, servicePassword);
                finalToken = authResponse.access_token;

                console.log('Successfully obtained service token for project deletion');
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

        // Forward request to backend
        const backendURL = getBackendURL();
        console.log(`Deleting project: ${projectId}`);

        await axios.delete(`${backendURL}/api/projects/${projectId}`, {
            headers: {
                Authorization: `Bearer ${finalToken}`
            }
        });

        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting project:', error);

        // Return proper error response
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || 'Failed to delete project';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    }
} 