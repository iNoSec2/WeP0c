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

        const backendURL = getBackendURL();
        console.log('Fetching recent vulnerabilities from:', `${backendURL}/api/vulnerabilities/recent`);

        // Forward the request to the backend with the token
        const response = await axios.get(`${backendURL}/api/vulnerabilities/recent`, {
            headers: {
                Authorization: `Bearer ${finalToken}`
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching recent vulnerabilities:', error);

        // Return proper error response
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || 'Failed to fetch recent vulnerabilities';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    }
}
