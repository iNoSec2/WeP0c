import { NextResponse } from 'next/server';
import apiService from '@/lib/api/apiService';
import { getToken } from '@/lib/api';
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

/**
 * Get service account token when needed
 */
async function getServiceToken() {
    try {
        // Use environment variables for service account credentials
        const serviceEmail = process.env.SERVICE_ACCOUNT_EMAIL || 'admin@example.com';
        const servicePassword = process.env.SERVICE_ACCOUNT_PASSWORD || 'admin123';

        // Login to get a valid token
        const authResponse = await loginToBackend(serviceEmail, servicePassword);
        console.log('Successfully obtained service token');
        return authResponse.access_token;
    } catch (error) {
        console.error('Failed to obtain service token:', error);
        return null;
    }
}

export async function GET(request: Request) {
    try {
        // Get token from request or service account if needed
        let finalToken = getTokenFromRequest(request);
        if (!finalToken) {
            finalToken = await getServiceToken();
        }

        // If still no token, return unauthorized
        if (!finalToken) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        // Use the centralized API service to fetch users
        const response = await apiService.get('/api/users');

        if (response.success) {
            return NextResponse.json(response.data);
        } else {
            // Handle errors with appropriate status code
            return NextResponse.json(
                {
                    error: response.error?.message || 'Failed to fetch users',
                    details: response.error?.details
                },
                { status: response.error?.code || 500 }
            );
        }
    } catch (error) {
        console.error('Unexpected error in admin users request:', error);
        return NextResponse.json(
            { error: 'Failed to process admin users request' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // Get token from request or service account if needed
        let finalToken = getTokenFromRequest(request);
        if (!finalToken) {
            finalToken = await getServiceToken();
        }

        // If still no token, return unauthorized
        if (!finalToken) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        // Parse the request body
        const userData = await request.json();
        console.log('Creating user with data:', userData);

        // Use the centralized API service to create the user
        const response = await apiService.post('/api/users', userData);

        if (response.success) {
            // Return successful creation with 201 status
            return NextResponse.json(response.data, { status: 201 });
        } else {
            // Return error with appropriate status code
            return NextResponse.json(
                {
                    error: response.error?.message || 'Failed to create user',
                    details: response.error?.details
                },
                { status: response.error?.code || 500 }
            );
        }
    } catch (error) {
        console.error('Unexpected error in user creation process:', error);
        return NextResponse.json(
            { error: 'Failed to process user creation request' },
            { status: 500 }
        );
    }
}
