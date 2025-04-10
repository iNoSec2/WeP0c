import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

// Helper function to get token from request
const getTokenFromRequest = (request: Request) => {
    const cookies = request.headers.get('cookie') || '';
    console.log('Admin users/id API - Full cookie string:', cookies);

    const tokenMatch = cookies.match(/token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    // Also check Authorization header as fallback
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.split(' ')[1];

    console.log('Admin users/id API - Token extraction results:', {
        hasCookieToken: !!token,
        hasHeaderToken: !!headerToken,
        source: token ? 'cookie' : headerToken ? 'header' : 'none'
    });

    // Use token from cookie or header
    return token || headerToken;
};

// Direct function to call backend for a specific user
async function callBackendUserAPI(id: string, token: string, method: string, body?: any) {
    const backendURL = getBackendURL();
    const url = `${backendURL}/api/admin/users/${id}`;

    console.log(`Admin API - Making ${method} request to: ${url}`);
    console.log('Using token:', token ? `${token.substring(0, 10)}...` : 'NO TOKEN');

    try {
        const config = {
            method,
            url,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: method !== 'GET' ? body : undefined,
            timeout: 15000
        };

        const response = await axios(config);
        console.log(`Backend response success:`, { status: response.status });
        return response;
    } catch (error: any) {
        console.error(`Backend API call failed:`, {
            status: error.response?.status,
            message: error.message
        });
        throw error;
    }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        // Get token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('Admin users/id API - No token found in request');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        const userId = params.id;
        console.log(`Admin users/id API - Fetching user with ID: ${userId}`);

        // Call backend
        const response = await callBackendUserAPI(userId, token, 'GET');

        // Return the user data
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Admin users/id API - Error:', error);

        // Get error details
        const status = error.response?.status || 500;
        const errorData = error.response?.data;

        return NextResponse.json(
            {
                error: errorData?.detail || 'Failed to fetch user',
                details: errorData
            },
            { status }
        );
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        // Get token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('Admin users/id API - No token found in request');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        const userId = params.id;
        const body = await request.json();
        console.log(`Admin users/id API - Updating user with ID: ${userId}`);

        // Call backend
        const response = await callBackendUserAPI(userId, token, 'PUT', body);

        // Return the updated user data
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Admin users/id API - Error:', error);

        // Get error details
        const status = error.response?.status || 500;
        const errorData = error.response?.data;

        return NextResponse.json(
            {
                error: errorData?.detail || 'Failed to update user',
                details: errorData
            },
            { status }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        // Get token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('Admin users/id API - No token found in request');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        const userId = params.id;
        console.log(`Admin users/id API - Deleting user with ID: ${userId}`);

        // Call backend
        await callBackendUserAPI(userId, token, 'DELETE');

        // Return success response
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error('Admin users/id API - Error:', error);

        // Get error details
        const status = error.response?.status || 500;
        const errorData = error.response?.data;

        return NextResponse.json(
            {
                error: errorData?.detail || 'Failed to delete user',
                details: errorData
            },
            { status }
        );
    }
} 