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
            // Return empty array instead of error for smooth UI rendering
            return NextResponse.json([], { status: 200 });
        }

        // Log token information for debugging (truncated for security)
        const tokenPreview = finalToken.substring(0, 10) + '...' + finalToken.substring(finalToken.length - 5);
        console.log('Using token:', tokenPreview);

        // For server-side API routes, use the service name
        const backendURL = "http://api:8001";
        console.log('Fetching recent vulnerabilities from:', `${backendURL}/api/vulnerabilities/recent`);

        // Forward the request to the backend with the token
        const response = await axios.get(`${backendURL}/api/vulnerabilities/recent`, {
            headers: {
                'Authorization': `Bearer ${finalToken}`
            },
            validateStatus: function (status) {
                return true; // Accept all status codes for handling
            }
        });

        // Handle different response cases
        if (response.status === 200) {
            // Ensure response.data is an array
            const vulnerabilities = Array.isArray(response.data) ? response.data : [];
            return NextResponse.json(vulnerabilities);
        } else {
            console.error('Backend error:', response.status, response.data);
            // Return empty array instead of error
            return NextResponse.json([], { status: 200 });
        }
    } catch (error: any) {
        console.error('Error fetching recent vulnerabilities:', error.response?.data || error.message);
        // Return empty array instead of error for smooth UI rendering
        return NextResponse.json([], { status: 200 });
    }
}
