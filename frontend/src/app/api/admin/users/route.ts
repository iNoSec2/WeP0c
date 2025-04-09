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

export async function GET(request: Request) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        const backendURL = getBackendURL();
        console.log('Fetching users from backend:', `${backendURL}/api/admin/users`);

        // Forward the request to the backend with the token
        const response = await axios.get(`${backendURL}/api/admin/users`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching users:', error);

        // Return proper error response
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || 'Failed to fetch users';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    }
}

export async function POST(request: Request) {
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

        const backendURL = getBackendURL();
        console.log('Creating user:', body);

        // Forward the request to the backend with the token
        const response = await axios.post(`${backendURL}/api/admin/user`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return NextResponse.json(response.data, { status: 201 });
    } catch (error: any) {
        console.error('Error creating user:', error);

        // Return proper error response
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || 'Failed to create user';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    }
} 