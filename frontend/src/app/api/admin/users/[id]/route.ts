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

interface UserParams {
    params: {
        id: string;
    };
}

export async function GET(request: Request, { params }: UserParams) {
    try {
        const userId = params.id;
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

        const backendURL = getBackendURL();
        console.log(`Fetching user ${userId} from backend:`, `${backendURL}/api/admin/users/${userId}`);

        try {
            // Forward the request to the backend with the token
            const response = await axios.get(`${backendURL}/api/admin/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${finalToken}`
                }
            });

            return NextResponse.json(response.data);
        } catch (apiError: any) {
            console.error('Backend API error:', apiError.message);

            // For development, provide mock data
            if (process.env.NODE_ENV === 'development') {
                console.log('Development mode: Returning mock user data');
                return NextResponse.json({
                    id: userId,
                    username: `user-${userId.substring(0, 5)}`,
                    email: `user-${userId.substring(0, 5)}@example.com`,
                    full_name: 'Sample User',
                    role: 'USER',
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }

            // Return proper error response
            const status = apiError.response?.status || 500;
            const message = apiError.response?.data?.detail || 'Failed to fetch user';

            return NextResponse.json(
                { error: message },
                { status: status }
            );
        }
    } catch (error: any) {
        console.error('Error in admin user details request:', error);

        // Return proper error response
        return NextResponse.json(
            { error: 'Failed to process admin user details request' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request, { params }: UserParams) {
    try {
        const userId = params.id;
        let finalToken = getTokenFromRequest(request);

        // If no token is available, try to login with service account
        if (!finalToken) {
            try {
                const serviceEmail = process.env.SERVICE_ACCOUNT_EMAIL || 'admin@example.com';
                const servicePassword = process.env.SERVICE_ACCOUNT_PASSWORD || 'admin123';

                const authResponse = await loginToBackend(serviceEmail, servicePassword);
                finalToken = authResponse.access_token;

                console.log('Successfully obtained service token for admin user update');
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

        const backendURL = getBackendURL();
        console.log(`Updating user ${userId}:`, body);

        try {
            // Forward the request to the backend with the token
            const response = await axios.patch(`${backendURL}/api/admin/users/${userId}`, body, {
                headers: {
                    Authorization: `Bearer ${finalToken}`,
                    'Content-Type': 'application/json'
                }
            });

            return NextResponse.json(response.data);
        } catch (apiError: any) {
            console.error('Backend API error during user update:', apiError.message);

            // For development, provide mock response
            if (process.env.NODE_ENV === 'development') {
                console.log('Development mode: Returning mock user update response');
                return NextResponse.json({
                    id: userId,
                    ...body,
                    updated_at: new Date().toISOString()
                });
            }

            // Return proper error response
            const status = apiError.response?.status || 500;
            const message = apiError.response?.data?.detail || 'Failed to update user';

            return NextResponse.json(
                { error: message },
                { status: status }
            );
        }
    } catch (error: any) {
        console.error('Error in user update process:', error);

        // Return proper error response
        return NextResponse.json(
            { error: 'Failed to process user update request' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: UserParams) {
    try {
        const userId = params.id;
        let finalToken = getTokenFromRequest(request);

        // If no token is available, try to login with service account
        if (!finalToken) {
            try {
                const serviceEmail = process.env.SERVICE_ACCOUNT_EMAIL || 'admin@example.com';
                const servicePassword = process.env.SERVICE_ACCOUNT_PASSWORD || 'admin123';

                const authResponse = await loginToBackend(serviceEmail, servicePassword);
                finalToken = authResponse.access_token;

                console.log('Successfully obtained service token for admin user deletion');
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

        const backendURL = getBackendURL();
        console.log(`Deleting user ${userId}`);

        try {
            // Forward the request to the backend with the token
            await axios.delete(`${backendURL}/api/admin/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${finalToken}`
                }
            });

            return NextResponse.json({ success: true, message: 'User deleted successfully' });
        } catch (apiError: any) {
            console.error('Backend API error during user deletion:', apiError.message);

            // For development, always return success in development mode
            if (process.env.NODE_ENV === 'development') {
                console.log('Development mode: Returning mock successful deletion response');
                return NextResponse.json({ success: true, message: 'User deleted successfully (mock)' });
            }

            // Return proper error response
            const status = apiError.response?.status || 500;
            const message = apiError.response?.data?.detail || 'Failed to delete user';

            return NextResponse.json(
                { error: message },
                { status: status }
            );
        }
    } catch (error: any) {
        console.error('Error in user deletion process:', error);

        // Return proper error response
        return NextResponse.json(
            { error: 'Failed to process user deletion request' },
            { status: 500 }
        );
    }
} 