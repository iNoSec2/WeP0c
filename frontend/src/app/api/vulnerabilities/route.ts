import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { loginToBackend } from '@/lib/api/loginUtil';
import { extractTokenFromRequest, createPermissionHeaders, withPermission, unauthorizedResponse } from '@/lib/api/serverAuth';
import { UserRole } from '@/lib/api/users';

export const GET = withPermission(
    async (req: NextRequest, token: string, role?: UserRole) => {
        try {
            // Forward request to backend with permission headers
            const backendURL = getBackendURL();
            const headers = createPermissionHeaders(role, token);

            console.log('Fetching vulnerabilities from:', `${backendURL}/api/vulnerabilities`);
            const response = await axios.get(`${backendURL}/api/vulnerabilities`, { headers });

            return NextResponse.json(response.data);
        } catch (error: any) {
            console.error('Error fetching vulnerabilities:', error);

            // Return proper error response
            const status = error.response?.status || 500;
            const message = error.response?.data?.detail || 'Failed to fetch vulnerabilities';

            return NextResponse.json({ error: message }, { status });
        }
    },
    ['pentester', 'client', 'admin', 'super_admin'] // All authenticated users can view vulnerabilities
);

export async function POST(req: NextRequest) {
    try {
        // Extract token from request
        let token = extractTokenFromRequest(req);

        // If no token is available, try to login with service account
        if (!token) {
            try {
                // Use environment variables for service account credentials
                const serviceEmail = process.env.SERVICE_ACCOUNT_EMAIL || 'admin@example.com';
                const servicePassword = process.env.SERVICE_ACCOUNT_PASSWORD || 'admin123';

                // Login to get a valid token
                const authResponse = await loginToBackend(serviceEmail, servicePassword);
                token = authResponse.access_token;

                console.log('Successfully obtained service token for vulnerability creation');
            } catch (loginError) {
                console.error('Failed to obtain service token:', loginError);
                return unauthorizedResponse('Authentication failed');
            }
        }

        if (!token) {
            return unauthorizedResponse('No valid token found');
        }

        // Parse the request body
        const data = await req.json();
        console.log('Creating vulnerability with data:', data);

        if (!data.project_id) {
            return NextResponse.json(
                { error: 'Project ID is required to create a vulnerability' },
                { status: 400 }
            );
        }

        // Extract the project_id from the request body
        const projectId = data.project_id;

        // Extract role from token - manually decode token to check if SUPER_ADMIN
        // This is a simplified approach for demonstration
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        const userRole = payload.role;

        console.log(`User role from token: ${userRole}`);

        // Forward request to backend using the specific endpoint for creating vulnerabilities
        const backendURL = getBackendURL();
        console.log(`Creating vulnerability for project ${projectId}`);

        try {
            // Generate headers with explicit override for SUPER_ADMIN
            const headers: Record<string, string> = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Explicitly add X-Override-Role header for SUPER_ADMIN and ADMIN users
            if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
                console.log(`Adding X-Override-Role header for ${userRole} user`);
                headers['X-Override-Role'] = 'true';
                headers['X-Admin-Access'] = 'true';
                headers['X-Admin-Override'] = 'true';

                // Log the override attempt for debugging
                console.log('Admin override headers added:', {
                    'X-Override-Role': 'true',
                    'X-Admin-Access': 'true',
                    'X-Admin-Override': 'true'
                });
            }

            console.log('Request headers:', headers);
            console.log('Sending data to backend:', data);

            // Special handling for specific project ID if needed
            if (projectId === '44ef495d-0117-40d4-8c12-0851ee26887a') {
                console.log('Using special handling for project ID: 44ef495d-0117-40d4-8c12-0851ee26887a');
                // Make sure all required fields are present
                if (!data.poc_zip_path) {
                    data.poc_zip_path = 'N/A';
                }
            }

            // Try the first endpoint format
            const response = await axios.post(
                `${backendURL}/api/vulnerabilities/${projectId}`,
                data,
                { headers }
            );

            return NextResponse.json(response.data, { status: 201 });
        } catch (innerError: any) {
            console.error('Error creating vulnerability:', innerError);

            // Return proper error response
            const status = innerError.response?.status || 500;
            const message = innerError.response?.data?.detail || innerError.response?.data?.error || innerError.message || 'Failed to create vulnerability';

            // Log detailed error information for debugging
            console.error('Error details:', {
                status,
                message,
                response: innerError.response?.data,
                error: innerError
            });

            return NextResponse.json({ error: message }, { status });
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