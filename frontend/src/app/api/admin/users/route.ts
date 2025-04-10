import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { serializeUserToBackend } from '@/lib/api/serializers';
import { FEATURES } from '@/lib/constants';

// Helper function to get token from request
const getTokenFromRequest = (request: Request) => {
    const cookies = request.headers.get('cookie') || '';
    console.log('Admin users API - Full cookie string:', cookies);

    const tokenMatch = cookies.match(/token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    // Also check Authorization header as fallback
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.split(' ')[1];

    console.log('Admin users API - Token extraction results:', {
        hasCookieToken: !!token,
        hasHeaderToken: !!headerToken,
        source: token ? 'cookie' : headerToken ? 'header' : 'none'
    });

    // Use token from cookie or header
    return token || headerToken;
};

export async function GET(request: Request) {
    try {
        // Get token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('Admin API - No authentication token found in request');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        // Get URL parameters
        const url = new URL(request.url);
        const skip = url.searchParams.get('skip') || '0';
        const limit = url.searchParams.get('limit') || '100';
        const role = url.searchParams.get('role');

        // Construct backend URL with all parameters
        const backendURL = getBackendURL();
        let backendEndpoint = `${backendURL}/api/admin/users?skip=${skip}&limit=${limit}`;

        if (role) {
            backendEndpoint += `&role=${encodeURIComponent(role.toUpperCase())}`;
        }

        console.log(`Admin API - Sending direct request to: ${backendEndpoint}`);
        console.log('Admin API - Token preview:', token.substring(0, 15) + '...');

        // Make direct request to backend
        const response = await axios.get(backendEndpoint, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000
        });

        console.log(`Admin API - Received successful response with ${response.data.length} users`);

        // Return the backend response directly
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Admin API - Error fetching users:', error);

        // Extract detailed error information
        const status = error.response?.status || 500;
        const errorData = error.response?.data;

        console.error('Admin API - Error details:', {
            status,
            url: error.config?.url,
            message: error.message,
            data: errorData
        });

        if (status === 401) {
            return NextResponse.json(
                {
                    error: 'Authentication required. Please log in again.',
                    details: errorData || { detail: 'Not authenticated' }
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                error: errorData?.detail || 'Failed to fetch users',
                details: errorData || { message: error.message }
            },
            { status }
        );
    }
}

export async function POST(request: Request) {
    try {
        // Get token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('Admin API - No authentication token found in request');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        // Parse request body
        const requestBody = await request.json();
        console.log('Admin API - Original request body:', requestBody);

        // Ensure role is uppercase for backend compatibility
        const userRole = requestBody.role || 'USER';
        const role = userRole.toUpperCase();

        // Prepare data for backend with proper serialization
        const userData = {
            ...requestBody,
            role: role // Ensure role is UPPERCASE for backend
        };

        // Properly serialize the user data for backend compatibility
        const serializedData = serializeUserToBackend(userData);

        if (FEATURES.DETAILED_ERRORS) {
            console.log('Admin API - Serialized data for backend:', serializedData);
        }

        // Construct backend URL
        const backendURL = getBackendURL();
        const backendEndpoint = `${backendURL}/api/admin/users`;

        console.log(`Admin API - Creating user via direct API call to: ${backendEndpoint}`);

        // Make direct request to backend with properly serialized data
        const response = await axios.post(backendEndpoint, serializedData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000
        });

        console.log('Admin API - User created successfully');

        // Return the backend response directly
        return NextResponse.json(response.data, { status: 201 });
    } catch (error: any) {
        console.error('Admin API - Error creating user:', error);

        // Extract detailed error information
        const status = error.response?.status || 500;
        const errorData = error.response?.data;

        // Show more detailed information for validation errors
        if (status === 422 && FEATURES.DETAILED_ERRORS) {
            console.error('Admin API - Validation error details:', errorData);
        }

        console.error('Admin API - Error details:', {
            status,
            url: error.config?.url,
            message: error.message,
            data: errorData
        });

        return NextResponse.json(
            {
                error: errorData?.detail || 'Failed to create user',
                details: errorData || { message: error.message }
            },
            { status }
        );
    }
}
