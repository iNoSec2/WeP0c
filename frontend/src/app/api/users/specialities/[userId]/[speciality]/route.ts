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

/**
 * POST handler to add a specific speciality to a user
 */
export async function POST(
    request: Request,
    { params }: { params: { userId: string, speciality: string } }
) {
    try {
        const { userId, speciality } = params;
        console.log(`Adding speciality "${speciality}" to user ${userId}`);

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
        const endpoint = `${backendURL}${userRoutes.addSpeciality(userId, speciality)}`;

        console.log(`Making POST request to backend: ${endpoint}`);

        // Make request to backend
        const response = await axios({
            method: 'POST',
            url: endpoint,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        // Return the updated user with specialities
        return NextResponse.json(response.data, { status: 200 });
    } catch (error: any) {
        console.error('Error adding speciality:', error);

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
                message: errorData?.detail || error.message || 'Failed to add speciality',
                details: errorData || {}
            },
            { status }
        );
    }
}

/**
 * DELETE handler to remove a specific speciality from a user
 */
export async function DELETE(
    request: Request,
    { params }: { params: { userId: string, speciality: string } }
) {
    try {
        const { userId, speciality } = params;
        console.log(`Removing speciality "${speciality}" from user ${userId}`);

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
        const endpoint = `${backendURL}${userRoutes.removeSpeciality(userId, speciality)}`;

        console.log(`Making DELETE request to backend: ${endpoint}`);

        // Make request to backend
        await axios({
            method: 'DELETE',
            url: endpoint,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        // Return success response
        return NextResponse.json({
            message: 'Speciality removed successfully',
            userId,
            speciality
        }, { status: 200 });
    } catch (error: any) {
        console.error('Error removing speciality:', error);

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
                message: errorData?.detail || error.message || 'Failed to remove speciality',
                details: errorData || {}
            },
            { status }
        );
    }
}

/**
 * GET handler to check if a user has a specific speciality
 */
export async function GET(
    request: Request,
    { params }: { params: { userId: string, speciality: string } }
) {
    try {
        const { userId, speciality } = params;
        console.log(`Checking if user ${userId} has speciality "${speciality}"`);

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

        console.log(`Making GET request to backend: ${endpoint}`);

        // Make request to backend to get all user specialities
        const response = await axios({
            method: 'GET',
            url: endpoint,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        // Check if the user has this speciality
        const userSpecialities = response.data;
        const hasSpeciality = Array.isArray(userSpecialities) &&
            userSpecialities.some(s => s.toLowerCase() === speciality.toLowerCase());

        // Return the result
        return NextResponse.json({
            userId,
            speciality,
            hasSpeciality
        });
    } catch (error: any) {
        console.error('Error checking speciality:', error);

        // Get detailed error information
        const status = error.response?.status || 500;
        const errorData = error.response?.data;

        return NextResponse.json(
            {
                status,
                message: errorData?.detail || error.message || 'Failed to check speciality',
                details: errorData || {}
            },
            { status }
        );
    }
} 