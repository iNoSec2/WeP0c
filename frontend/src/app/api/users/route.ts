import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { serializeUsersFromBackend } from '@/lib/api/serializers';
import { userRoutes } from '@/lib/api/routes';

// Helper function to get token from request
const getTokenFromRequest = (request: Request) => {
    // Check cookie header first
    const cookies = request.headers.get('cookie') || '';
    console.log('Full cookie string:', cookies);

    const tokenMatch = cookies.match(/token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    // Also check Authorization header as fallback
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.split(' ')[1];

    console.log('Token extraction results:', {
        hasCookieToken: !!token,
        hasHeaderToken: !!headerToken
    });

    // Use token from cookie or header
    return token || headerToken;
};

// Direct function to make admin API call
async function callBackendAdminAPI(endpoint: string, token: string, method: string = 'GET', data?: any) {
    const backendURL = getBackendURL();
    const url = `${backendURL}${endpoint}`;

    console.log(`Making ${method} request to backend:`, url);
    console.log('Using token:', token ? `${token.substring(0, 10)}...` : 'NO TOKEN');

    try {
        const response = await axios({
            method,
            url,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: method !== 'GET' ? data : undefined,
            timeout: 15000
        });

        console.log(`Backend response success:`, {
            status: response.status,
            dataCount: Array.isArray(response.data) ? response.data.length : 'N/A'
        });

        return response;
    } catch (error: any) {
        console.error(`Backend API call failed:`, {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });
        throw error;
    }
}

export async function GET(request: Request) {
    try {
        // Extract token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('No authentication token found in request');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        // Get URL parameters
        const url = new URL(request.url);
        const role = url.searchParams.get('role');
        const skip = url.searchParams.get('skip') || '0';
        const limit = url.searchParams.get('limit') || '100';

        // Log the request for debugging
        console.log(`Users API request with params:`, {
            role: role || 'none',
            skip,
            limit,
            tokenLength: token.length
        });

        // Construct backend URL directly using the admin endpoint
        let backendEndpoint = `/api/admin/users?skip=${skip}&limit=${limit}`;

        // Add role filter if specified
        if (role) {
            backendEndpoint += `&role=${encodeURIComponent(role.toUpperCase())}`;
        }

        // Make direct request to backend with token
        const response = await callBackendAdminAPI(backendEndpoint, token);

        // Return the serialized users
        return NextResponse.json(serializeUsersFromBackend(response.data));
    } catch (error: any) {
        console.error('Error in users endpoint:', error);

        // Get detailed error information
        const status = error.response?.status || 500;
        const errorData = error.response?.data;

        // Show relevant error details
        console.error('Error details:', {
            status,
            url: error.config?.url || 'unknown',
            data: errorData || {},
            message: error.message
        });

        if (status === 401) {
            return NextResponse.json(
                {
                    url: '/api/users',
                    status: 401,
                    message: 'Authentication required. Please log in again.',
                    details: errorData || { detail: 'Not authenticated' }
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                status,
                message: errorData?.detail || error.message || 'An error occurred while fetching users',
                details: errorData || {}
            },
            { status }
        );
    }
}

export async function POST(request: Request) {
    try {
        // Extract token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('No authentication token found in request');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        // Extract request body
        const body = await request.json();

        // Make direct request to backend admin API
        const backendEndpoint = '/api/admin/users';
        const response = await callBackendAdminAPI(backendEndpoint, token, 'POST', body);

        // Return the created user
        return NextResponse.json(response.data, { status: 201 });
    } catch (error: any) {
        console.error('Error in users POST endpoint:', error);

        // Get detailed error information
        const status = error.response?.status || 500;
        const errorData = error.response?.data;

        // Show relevant error details
        console.error('Error details:', {
            status,
            url: error.config?.url || 'unknown',
            data: errorData || {},
            message: error.message
        });

        return NextResponse.json(
            {
                status,
                message: errorData?.detail || error.message || 'An error occurred while creating user',
                details: errorData || {}
            },
            { status }
        );
    }
}

