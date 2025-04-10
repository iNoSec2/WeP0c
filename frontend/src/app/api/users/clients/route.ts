import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { userRoutes, normalizeRole } from '@/lib/api/routes';
import { serializeUsersFromBackend } from '@/lib/api/serializers';

// Helper function to get token from request
const getTokenFromRequest = (request: Request) => {
    // Check cookie header first
    const cookies = request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    // Also check Authorization header as fallback
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.split(' ')[1];

    // Use token from cookie or header
    return token || headerToken;
};

export async function GET(request: Request) {
    try {
        // Extract token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('No authentication token found in request for clients endpoint');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        // Get URL parameters
        const url = new URL(request.url);
        const skip = url.searchParams.get('skip') || '0';
        const limit = url.searchParams.get('limit') || '100';

        // Log the request
        console.log(`Clients API request with params:`, { skip, limit });

        // Use the centralized route from userRoutes
        const endpoint = userRoutes.clients;
        console.log(`Fetching clients from endpoint: ${endpoint}`);

        const backendURL = getBackendURL();
        const backendEndpoint = `${backendURL}${endpoint}?skip=${skip}&limit=${limit}`;

        // Make request to backend with token
        const response = await axios({
            method: 'GET',
            url: backendEndpoint,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        // Return the serialized users
        return NextResponse.json(serializeUsersFromBackend(response.data));
    } catch (error: any) {
        console.error('Error in clients endpoint:', error);

        // Handle connection errors specifically
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return NextResponse.json(
                {
                    error: 'Could not connect to backend service. Please try again later.',
                    details: error.message
                },
                { status: 503 }
            );
        }

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
                status,
                message: errorData?.detail || error.message || 'An error occurred while fetching clients',
                details: errorData || {}
            },
            { status }
        );
    }
}

export async function POST(request: Request) {
    try {
        // Extract token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('No authentication token found in request for creating client');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        // Extract request body
        const body = await request.json();
        console.log('Creating client with data:', body);

        // Use the centralized route from userRoutes
        const endpoint = userRoutes.clients;
        console.log(`Creating client at endpoint: ${endpoint}`);

        const backendURL = getBackendURL();
        const backendEndpoint = `${backendURL}${endpoint}`;

        // Make request to backend with token
        const response = await axios({
            method: 'POST',
            url: backendEndpoint,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: body,
            timeout: 10000
        });

        // Return the created client
        return NextResponse.json(response.data, { status: 201 });
    } catch (error: any) {
        console.error('Error in creating client:', error);

        // Handle connection errors specifically
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return NextResponse.json(
                {
                    error: 'Could not connect to backend service. Please try again later.',
                    details: error.message
                },
                { status: 503 }
            );
        }

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
                status,
                message: errorData?.detail || error.message || 'An error occurred while creating client',
                details: errorData || {}
            },
            { status }
        );
    }
} 