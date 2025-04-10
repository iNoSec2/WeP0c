import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/api/adminClient';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

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

        // Get the backend URL
        const backendURL = getBackendURL();
        console.log(`Fetching recent vulnerabilities from: ${backendURL}/api/recent`);

        // Use axios directly for better error handling
        const response = await axios.get(`${backendURL}/api/recent`, {
            headers: {
                'Authorization': `Bearer ${finalToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Log the response for debugging
        console.log('Recent vulnerabilities response:', response.status);

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching recent vulnerabilities:',
            error.response?.data?.detail || error.message || 'Unknown error');

        // Return empty array instead of error for smooth UI rendering
        return NextResponse.json([], { status: 200 });
    }
}
