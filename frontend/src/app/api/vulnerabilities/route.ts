import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { loginToBackend } from '@/lib/api/loginUtil';
import { getAuthHeaders } from '@/lib/api/permissionUtils';
import { getUserRoleFromToken } from '@/lib/api/tokenUtils';

export async function GET(request: Request) {
    try {
        // Get token from cookies
        const cookies = request.headers.get('cookie') || '';
        const tokenMatch = cookies.match(/token=([^;]+)/);
        const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

        // Also check Authorization header as fallback
        const authHeader = request.headers.get('Authorization');
        const headerToken = authHeader?.split(' ')[1];

        // Use token from cookie or header
        const finalToken = token || headerToken;

        if (!finalToken) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        // Get user role from token for permission handling
        const userRole = getUserRoleFromToken(finalToken);

        // Generate appropriate headers with permission handling
        const headers = getAuthHeaders(finalToken, userRole);

        // Forward request to backend
        const backendURL = getBackendURL();
        console.log('Fetching vulnerabilities from:', `${backendURL}/api/vulnerabilities`);

        const response = await axios.get(`${backendURL}/api/vulnerabilities`, { headers });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching vulnerabilities:', error);

        // Return proper error response
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || 'Failed to fetch vulnerabilities';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    }
}

export async function POST(request: Request) {
    try {
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

                console.log('Successfully obtained service token for vulnerability creation');
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

        // Get user role from token
        const userRole = getUserRoleFromToken(finalToken);

        // Parse the request body
        const data = await request.json();
        console.log('Creating vulnerability with data:', data);

        if (!data.project_id) {
            return NextResponse.json(
                { error: 'Project ID is required to create a vulnerability' },
                { status: 400 }
            );
        }

        // Extract the project_id from the request body
        const projectId = data.project_id;

        // Forward request to backend using the specific endpoint for creating vulnerabilities
        const backendURL = getBackendURL();
        console.log(`Creating vulnerability for project ${projectId}`);

        try {
            // Generate appropriate headers with permission handling
            const headers = getAuthHeaders(finalToken, userRole);

            // Try the first endpoint format
            const response = await axios.post(`${backendURL}/api/vulnerabilities/${projectId}`, data, { headers });

            return NextResponse.json(response.data, { status: 201 });
        } catch (innerError: any) {
            console.error('Error creating vulnerability:', innerError);

            // If in development and we get an error, return mock data
            if (process.env.NODE_ENV === 'development') {
                console.log('Returning mock vulnerability data for development');
                return NextResponse.json({
                    id: '12345',
                    title: data.title || 'New Vulnerability',
                    description_md: data.description_md || 'Description goes here',
                    poc_type: data.poc_type || 'text',
                    poc_code: data.poc_code || '',
                    severity: data.severity || 'medium',
                    status: data.status || 'open',
                    project_id: projectId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }, { status: 201 });
            }

            // Return proper error response
            const status = innerError.response?.status || 500;
            const message = innerError.response?.data?.detail || 'Failed to create vulnerability';

            return NextResponse.json(
                { error: message },
                { status: status }
            );
        }
    } catch (error: any) {
        console.error('Error in vulnerability creation:', error);

        // Return proper error response
        return NextResponse.json(
            { error: 'Failed to process vulnerability creation request' },
            { status: 500 }
        );
    }
}