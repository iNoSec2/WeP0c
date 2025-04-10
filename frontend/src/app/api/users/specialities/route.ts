import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { userRoutes, normalizeId } from '@/lib/api/routes';

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

// Helper function to handle API requests to the backend
async function makeBackendRequest(url: string, token: string, method: string = 'GET', data?: any) {
    console.log(`Making ${method} request to backend:`, url);

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
            timeout: 10000
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

/**
 * GET handler for specialities
 * Can be used to:
 * 1. Get all available specialities: /api/users/specialities
 * 2. Get specialities for a specific user: /api/users/specialities?userId=123
 */
export async function GET(request: Request) {
    try {
        // Extract token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('No authentication token found in request for specialities endpoint');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        // Get URL parameters
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        // Prepare backend URL
        const backendURL = getBackendURL();
        let endpoint: string;

        if (userId) {
            // Get specialities for a specific user
            endpoint = `${backendURL}${userRoutes.userSpecialities(userId)}`;
            console.log(`Fetching specialities for user ${userId}`);
        } else {
            // Get all available specialities
            endpoint = `${backendURL}${userRoutes.specialities}`;
            console.log('Fetching all available specialities');
        }

        // Make request to backend
        const response = await makeBackendRequest(endpoint, token);

        // Return the specialities
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error in specialities endpoint:', error);

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

        return NextResponse.json(
            {
                status,
                message: errorData?.detail || error.message || 'An error occurred while fetching specialities',
                details: errorData || {}
            },
            { status }
        );
    }
}

/**
 * POST handler for adding a speciality to a user
 * Expected body: { userId: string, speciality: string }
 */
export async function POST(request: Request) {
    try {
        // Extract token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('No authentication token found in request for adding speciality');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        // Extract request body
        const body = await request.json();
        console.log('Adding speciality with data:', body);

        // Validate required fields
        if (!body.userId || !body.speciality) {
            return NextResponse.json(
                { error: 'Both userId and speciality are required' },
                { status: 400 }
            );
        }

        const userId = normalizeId(body.userId);
        const speciality = String(body.speciality).trim();

        // Prepare backend URL
        const backendURL = getBackendURL();
        const endpoint = `${backendURL}${userRoutes.addSpeciality(userId, speciality)}`;

        // Make request to backend
        const response = await makeBackendRequest(endpoint, token, 'POST');

        // Return the updated user with specialities
        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        console.error('Error in adding speciality:', error);

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

        return NextResponse.json(
            {
                status,
                message: errorData?.detail || error.message || 'An error occurred while adding speciality',
                details: errorData || {}
            },
            { status }
        );
    }
}

/**
 * DELETE handler for removing a speciality from a user
 * Expected query parameters: userId and speciality
 */
export async function DELETE(request: Request) {
    try {
        // Extract token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('No authentication token found in request for removing speciality');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        // Get URL parameters
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        const speciality = url.searchParams.get('speciality');

        // Validate required parameters
        if (!userId || !speciality) {
            return NextResponse.json(
                { error: 'Both userId and speciality are required for deletion' },
                { status: 400 }
            );
        }

        // Prepare backend URL
        const backendURL = getBackendURL();
        const endpoint = `${backendURL}${userRoutes.removeSpeciality(userId, speciality)}`;

        // Make request to backend
        await makeBackendRequest(endpoint, token, 'DELETE');

        // Return success response
        return NextResponse.json({
            message: 'Speciality removed successfully',
            userId,
            speciality
        }, { status: 200 });
    } catch (error: any) {
        console.error('Error in removing speciality:', error);

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

        return NextResponse.json(
            {
                status,
                message: errorData?.detail || error.message || 'An error occurred while removing speciality',
                details: errorData || {}
            },
            { status }
        );
    }
} 