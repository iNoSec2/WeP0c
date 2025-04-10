import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

// Helper function to get token from request
const getTokenFromRequest = (request: Request) => {
    const cookies = request.headers.get('cookie') || '';
    console.log('Full cookie string:', cookies);

    const tokenMatch = cookies.match(/token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    // Also check Authorization header as fallback
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.split(' ')[1];

    console.log('Token extraction results:', {
        hasCookieToken: !!token,
        hasHeaderToken: !!headerToken,
        source: token ? 'cookie' : headerToken ? 'header' : 'none'
    });

    // Use token from cookie or header
    return token || headerToken;
};

// Direct function to make admin API call for a specific user
async function callBackendUserAPI(id: string, token: string, method: string = 'GET', data?: any) {
    const backendURL = getBackendURL();
    const url = `${backendURL}/api/admin/users/${id}`;

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
            data: response.data ? 'present' : 'none'
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

        const userId = params.id;
        console.log(`Fetching user with ID: ${userId}`);

        // Make direct request to backend API
        const response = await callBackendUserAPI(userId, token);

        // Return user data
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error fetching user with ID ${params.id}:`, error);

        // Get detailed error information
        const status = error.response?.status || 500;
        const errorData = error.response?.data;

        if (status === 401) {
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                error: errorData?.detail || error.message || 'Failed to fetch user',
                details: errorData
            },
            { status }
        );
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

        const userId = params.id;
        const data = await request.json();
        console.log(`Updating user with ID: ${userId}`);

        // Make direct request to backend API
        const response = await callBackendUserAPI(userId, token, 'PUT', data);

        // Return updated user data
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error updating user with ID ${params.id}:`, error);

        // Get detailed error information
        const status = error.response?.status || 500;
        const errorData = error.response?.data;

        return NextResponse.json(
            {
                error: errorData?.detail || error.message || 'Failed to update user',
                details: errorData
            },
            { status }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

        const userId = params.id;
        console.log(`Deleting user with ID: ${userId}`);

        // Make direct request to backend API
        await callBackendUserAPI(userId, token, 'DELETE');

        // Return success with 204 No Content
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error(`Error deleting user with ID ${params.id}:`, error);

        // Get detailed error information
        const status = error.response?.status || 500;
        const errorData = error.response?.data;

        return NextResponse.json(
            {
                error: errorData?.detail || error.message || 'Failed to delete user',
                details: errorData
            },
            { status }
        );
    }
} 