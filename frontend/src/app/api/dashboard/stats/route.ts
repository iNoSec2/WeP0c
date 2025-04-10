import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
    try {
        // Get token from cookies
        const cookies = request.headers.get('cookie') || '';
        const tokenMatch = cookies.match(/token=([^;]+)/);
        const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

        // Also check Authorization header as fallback
        const authHeader = request.headers.get('Authorization');
        const headerToken = authHeader?.split(' ')[1];

        // Use token from cookie or header
        const finalToken = token || headerToken;

        if (!finalToken) {
            console.error('No valid token found in cookies or Authorization header');
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        // Log token information for debugging (full token for troubleshooting)
        console.log('Using full token:', finalToken);

        // For server-side API routes, use the service name
        const backendURL = "http://api:8001";
        console.log('Fetching dashboard stats from:', `${backendURL}/api/dashboard/stats`);

        // Forward the request to the backend with the token in the exact format expected by FastAPI
        const response = await axios.get(`${backendURL}/api/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${finalToken}`
            },
            validateStatus: function (status) {
                return true; // Allow all status codes for debugging
            }
        });

        // Log the full response for debugging
        console.log('Backend response status:', response.status);
        console.log('Backend response headers:', response.headers);
        console.log('Backend response data:', response.data);

        // If backend returns 401, include the detail in the response
        if (response.status === 401) {
            console.error('Backend authentication failed:', response.data);
            return NextResponse.json(
                { error: response.data.detail || 'Authentication failed' },
                { status: 401 }
            );
        }

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching dashboard stats:', error.response?.data || error.message);

        // Return proper error response
        const status = error.response?.status || 500;
        const message = error.response?.data?.detail || 'Failed to fetch dashboard statistics';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    }
}
