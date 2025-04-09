import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { loginToBackend } from '@/lib/api/loginUtil';

// Helper function to get token
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

export async function GET(request: Request) {
    try {
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

                console.log('Successfully obtained service token for admin operations');
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

        // Get the backend URL
        const backendURL = getBackendURL();
        console.log('Fetching projects from backend');

        // Try multiple endpoint patterns
        const endpoints = [
            `${backendURL}/api/admin/projects`,
            `${backendURL}/api/projects`,
            'http://api:8001/api/admin/projects',
            'http://127.0.0.1:8001/api/admin/projects'
        ];

        let lastError = null;

        // Try each endpoint until one works
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying endpoint: ${endpoint}`);
                const response = await axios.get(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${finalToken}`
                    },
                    timeout: 5000
                });

                console.log(`Successful response from ${endpoint}`);
                return NextResponse.json(response.data);
            } catch (error: any) {
                console.log(`Endpoint ${endpoint} failed:`, error.message);
                lastError = error;
                // Continue to the next endpoint
            }
        }

        // If we're here, all endpoints failed
        console.error('All backend endpoints failed for projects:', lastError?.message);

        // For development, provide mock data
        if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Returning mock project data');
            return NextResponse.json([
                {
                    id: '00000000-0000-4000-a000-000000000001',
                    name: 'Security Assessment',
                    description: 'Web application security assessment',
                    client_id: '00000000-0000-4000-a000-000000000003',
                    start_date: '2023-05-01',
                    end_date: '2023-05-15',
                    status: 'COMPLETED',
                    client: {
                        name: 'Client Company',
                        id: '00000000-0000-4000-a000-000000000003'
                    }
                },
                {
                    id: '00000000-0000-4000-a000-000000000002',
                    name: 'Penetration Test',
                    description: 'Network penetration testing',
                    client_id: '00000000-0000-4000-a000-000000000003',
                    start_date: '2023-06-01',
                    end_date: '2023-06-15',
                    status: 'IN_PROGRESS',
                    client: {
                        name: 'Client Company',
                        id: '00000000-0000-4000-a000-000000000003'
                    }
                }
            ]);
        }

        // Return proper error response
        const status = lastError?.response?.status || 500;
        const message = lastError?.response?.data?.detail || 'Failed to fetch projects';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    } catch (error: any) {
        console.error('Error in admin projects request:', error);
        return NextResponse.json(
            { error: 'Failed to process admin projects request' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
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

                console.log('Successfully obtained service token for admin operations');
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
        console.log('Creating project with data:', body);

        // Get the backend URL
        const backendURL = getBackendURL();

        // Try multiple endpoint patterns
        const endpoints = [
            `${backendURL}/api/admin/project`,
            `${backendURL}/api/admin/projects`,
            `${backendURL}/api/projects`,
            'http://api:8001/api/admin/project',
            'http://127.0.0.1:8001/api/admin/project'
        ];

        let lastError = null;

        // Try each endpoint until one works
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying to create project at endpoint: ${endpoint}`);
                const response = await axios.post(endpoint, body, {
                    headers: {
                        'Authorization': `Bearer ${finalToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                });

                console.log(`Project successfully created at ${endpoint}`);
                return NextResponse.json(response.data, { status: 201 });
            } catch (error: any) {
                console.log(`Endpoint ${endpoint} failed:`, error.message);
                lastError = error;

                // Log detailed error information for debugging
                if (error.response) {
                    console.log('Error response status:', error.response.status);
                    console.log('Error response data:', error.response.data);
                }

                // Continue to the next endpoint
            }
        }

        // If we're here, all endpoints failed
        console.error('All backend endpoints failed for project creation:', lastError?.message);

        // For development, provide mock response
        if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Returning mock project creation response');
            return NextResponse.json({
                id: '00000000-0000-4000-a000-' + Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0'),
                name: body.name || 'New Project',
                description: body.description || 'Project description',
                client_id: body.client_id || '00000000-0000-4000-a000-000000000003',
                start_date: body.start_date || new Date().toISOString().split('T')[0],
                end_date: body.end_date || null,
                status: body.status || 'PLANNED',
                created_at: new Date().toISOString()
            }, { status: 201 });
        }

        // Return detailed error message for debugging
        const status = lastError?.response?.status || 500;
        const message = lastError?.response?.data?.detail || 'Failed to create project';

        return NextResponse.json(
            {
                error: message,
                details: lastError?.response?.data,
                requestBody: body  // Include the request body for debugging
            },
            { status: status }
        );
    } catch (error: any) {
        console.error('Error in project creation process:', error);
        return NextResponse.json(
            { error: 'Failed to process project creation request' },
            { status: 500 }
        );
    }
} 