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
        console.log('Fetching vulnerabilities from:', `${backendURL}/api/vulnerabilities`);

        const response = await axios.get(`${backendURL}/api/vulnerabilities`, {
            headers: {
                Authorization: `Bearer ${finalToken}`
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching vulnerabilities:', error);

        // Return proper error response
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || 'Failed to fetch vulnerabilities';

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
        const data = await request.json();

        // Forward request to backend
        const backendURL = getBackendURL();
        console.log('Creating vulnerability:', data);

        const response = await axios.post(`${backendURL}/api/vulnerabilities`, data, {
            headers: {
                Authorization: `Bearer ${finalToken}`,
                'Content-Type': 'application/json'
            }
        });

        return NextResponse.json(response.data, { status: 201 });
    } catch (error: any) {
        console.error('Error creating vulnerability:', error);

        // Return proper error response
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || 'Failed to create vulnerability';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    }
}