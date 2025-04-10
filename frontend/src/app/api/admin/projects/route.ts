import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { loginToBackend } from '@/lib/api/loginUtil';

const getTokenFromRequest = (request: Request) => {
    const cookies = request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.split(' ')[1];

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

        // API container URLs - direct connection via Docker network
        const apiEndpoints = [
            'http://api:8001/api/admin/projects',  // Correct endpoint from admin.py
            'http://api:8001/api/projects'         // Regular projects endpoint
        ];

        // IPv4 direct URLs - for local development
        const ipEndpoints = [
            'http://127.0.0.1:8001/api/admin/projects',
            'http://127.0.0.1:8001/api/projects'
        ];

        // Dynamic URLs - fallback using the environment variable
        const dynamicBackendURL = getBackendURL();
        const dynamicEndpoints = [
            `${dynamicBackendURL}/api/admin/projects`,
            `${dynamicBackendURL}/api/projects`
        ];

        // Combine all endpoint patterns prioritizing the ones that are most likely to work
        const endpoints = [
            ...apiEndpoints,     // Docker container names - highest priority in Docker environment
            ...ipEndpoints,      // Direct IP - good for local development
            ...dynamicEndpoints  // Dynamic endpoint - fallback
        ];

        let lastError = null;

        // Try each endpoint until one works
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying to fetch projects from: ${endpoint}`);
                const response = await axios.get(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${finalToken}`
                    },
                    timeout: 5000 // 5 second timeout
                });

                console.log(`Successfully fetched projects from ${endpoint}`);
                return NextResponse.json(response.data);
            } catch (error: any) {
                console.log(`Endpoint ${endpoint} failed: ${error.message}`);

                // Log detailed error for debugging
                if (error.response) {
                    console.log(`Status: ${error.response.status}, Data:`, error.response.data);
                }

                lastError = error;
                // Continue to the next endpoint
            }
        }

        // If we're here, all endpoints failed
        console.error('All backend endpoints failed for projects:', lastError?.message);

        // Return proper error response with details
        const status = lastError?.response?.status || 500;
        const message = lastError?.response?.data?.detail || 'Failed to fetch projects';

        return NextResponse.json(
            {
                error: message,
                message: "Unable to connect to project management service. Please check network connectivity or contact support."
            },
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

        // Validate required fields
        if (!body.name) {
            return NextResponse.json(
                { error: 'Project name is required' },
                { status: 400 }
            );
        }

        // API container URLs - direct connection via Docker network
        const apiEndpoints = [
            'http://api:8001/api/projects',
            'http://api:8001/api/admin/projects'
        ];

        // IPv4 direct URLs - for local development
        const ipEndpoints = [
            'http://127.0.0.1:8001/api/projects',
            'http://127.0.0.1:8001/api/admin/projects'
        ];

        // Dynamic URLs - fallback using the environment variable
        const dynamicBackendURL = getBackendURL();
        const dynamicEndpoints = [
            `${dynamicBackendURL}/api/projects`,
            `${dynamicBackendURL}/api/admin/projects`
        ];

        // Combine all endpoint patterns prioritizing the ones that are most likely to work
        const endpoints = [
            ...apiEndpoints,     // Docker container names - highest priority in Docker environment
            ...ipEndpoints,      // Direct IP - good for local development
            ...dynamicEndpoints  // Dynamic endpoint - fallback
        ];

        let lastError = null;

        // Try each endpoint until one works
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying to create project at: ${endpoint}`);
                const response = await axios.post(endpoint, body, {
                    headers: {
                        'Authorization': `Bearer ${finalToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 8000 // 8 second timeout - projects may take longer to create
                });

                console.log(`Project successfully created at ${endpoint}`);
                return NextResponse.json(response.data, { status: 201 });
            } catch (error: any) {
                console.log(`Endpoint ${endpoint} failed: ${error.message}`);

                // Log detailed error for debugging
                if (error.response) {
                    console.log(`Error status: ${error.response.status}`);
                    console.log('Error details:', error.response.data);
                }

                lastError = error;
                // Continue to the next endpoint
            }
        }

        // If we're here, all endpoints failed
        console.error('All backend endpoints failed for project creation:', lastError?.message);

        // Return detailed error message for API debugging
        const status = lastError?.response?.status || 500;
        const message = lastError?.response?.data?.detail || 'Failed to create project';

        return NextResponse.json(
            {
                error: message,
                message: "Unable to create project. Please verify the information and try again.",
                details: lastError?.response?.data
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