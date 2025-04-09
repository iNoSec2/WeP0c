import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

export async function GET(request: Request) {
    try {
        // Get token from cookies
        const cookies = request.headers.get('cookie') || '';
        const tokenMatch = cookies.match(/token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

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

        // Forward request to backend
        const backendURL = getBackendURL();
        console.log('Fetching POCs from:', `${backendURL}/api/pocs`);

        const response = await axios.get(`${backendURL}/api/pocs`, {
            headers: {
                Authorization: `Bearer ${finalToken}`
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching POCs:', error);

        // Return proper error response
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || 'Failed to fetch POCs';

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
        const token = tokenMatch ? tokenMatch[1] : null;

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

        // Parse the request body
        const body = await request.json();

        // Forward request to backend
        const backendURL = getBackendURL();
        console.log('Creating POC:', body);

        const response = await axios.post(`${backendURL}/api/pocs`, body, {
            headers: {
                Authorization: `Bearer ${finalToken}`,
                'Content-Type': 'application/json'
            }
        });

        return NextResponse.json(response.data, { status: 201 });
    } catch (error: any) {
        console.error('Error creating POC:', error);

        // Return proper error response
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || 'Failed to create POC';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    }
}
