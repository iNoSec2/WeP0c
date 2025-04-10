import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { userRoutes } from '@/lib/api/routes';

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
 * GET handler to retrieve all specialities for a specific user
 */
export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const userId = params.userId;
        console.log(`Fetching specialities for user: ${userId}`);

        // Extract token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('No authentication token found in request');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        // Prepare backend URL
        const backendURL = getBackendURL();
        const endpoint = `${backendURL}${userRoutes.userSpecialities(userId)}`;

        // Make request to backend
        const response = await makeBackendRequest(endpoint, token);

        // Return the specialities
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching user specialities:', error);

        // Get detailed error information
        const status = error.response?.status || 500;
        const errorData = error.response?.data;

        return NextResponse.json(
            {
                status,
                message: errorData?.detail || error.message || 'Failed to fetch user specialities',
                details: errorData || {}
            },
            { status }
        );
    }
}

/**
 * POST handler to add a speciality to a user
 * Expected request body: { speciality: string }
 */
export async function POST(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const userId = params.userId;

        // Extract token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('No authentication token found in request');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        // Extract request body
        const body = await request.json();

        if (!body.speciality) {
            return NextResponse.json(
                { error: 'Speciality is required' },
                { status: 400 }
            );
        }

        const speciality = String(body.speciality).trim();
        console.log(`Adding speciality "${speciality}" to user ${userId}`);

        // Prepare backend URL
        const backendURL = getBackendURL();
        const endpoint = `${backendURL}${userRoutes.addSpeciality(userId, speciality)}`;

        // Make request to backend
        const response = await makeBackendRequest(endpoint, token, 'POST');

        // Return the updated user data
        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        console.error('Error adding speciality:', error);

        // Get detailed error information
        const status = error.response?.status || 500;
        const errorData = error.response?.data;

        return NextResponse.json(
            {
                status,
                message: errorData?.detail || error.message || 'Failed to add speciality',
                details: errorData || {}
            },
            { status }
        );
    }
}

/**
 * DELETE handler to remove all specialities from a user
 * To remove specific specialities, use the [userId]/[speciality] endpoint
 */
export async function DELETE(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const userId = params.userId;
        console.log(`Removing all specialities for user: ${userId}`);

        // Extract token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('No authentication token found in request');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        // Prepare backend URL - first get current specialities
        const backendURL = getBackendURL();
        const getEndpoint = `${backendURL}${userRoutes.userSpecialities(userId)}`;

        try {
            // Get current specialities
            const getResponse = await makeBackendRequest(getEndpoint, token);
            const specialities = getResponse.data;

            if (!specialities || !Array.isArray(specialities) || specialities.length === 0) {
                // No specialities to remove
                return NextResponse.json({
                    message: 'No specialities found for user',
                    userId
                });
            }

            // Remove each speciality
            const removePromises = specialities.map(speciality => {
                const removeEndpoint = `${backendURL}${userRoutes.removeSpeciality(userId, speciality)}`;
                return makeBackendRequest(removeEndpoint, token, 'DELETE');
            });

            await Promise.all(removePromises);

            return NextResponse.json({
                message: 'All specialities removed successfully',
                userId,
                removedCount: specialities.length
            });
        } catch (error) {
            throw error;
        }
    } catch (error: any) {
        console.error('Error removing specialities:', error);

        // Get detailed error information
        const status = error.response?.status || 500;
        const errorData = error.response?.data;

        return NextResponse.json(
            {
                status,
                message: errorData?.detail || error.message || 'Failed to remove specialities',
                details: errorData || {}
            },
            { status }
        );
    }
} 