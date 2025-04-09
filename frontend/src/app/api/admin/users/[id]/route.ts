import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

// Helper function to get token
const getTokenFromRequest = (request: Request) => {
    const cookies = request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

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
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        const userId = params.id;
        const backendURL = getBackendURL();

        // Forward the request to the backend with the token
        const response = await axios.get(`${backendURL}/api/admin/user/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error fetching user ${params.id}:`, error);

        // Return proper error response
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || 'Failed to fetch user';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    }
}

export async function PATCH(request: Request, { params }: UserParams) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        // Parse the request body
        const body = await request.json();
        const userId = params.id;
        const backendURL = getBackendURL();

        // Forward the request to the backend with the token
        const response = await axios.patch(`${backendURL}/api/admin/user/${userId}`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error updating user ${params.id}:`, error);

        // Return proper error response
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || 'Failed to update user';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    }
}

export async function DELETE(request: Request, { params }: UserParams) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        const userId = params.id;
        const backendURL = getBackendURL();

        // Forward the request to the backend with the token
        const response = await axios.delete(`${backendURL}/api/admin/user/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`Error deleting user ${params.id}:`, error);

        // Return proper error response
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || 'Failed to delete user';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    }
} 