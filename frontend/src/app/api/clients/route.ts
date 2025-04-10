import { NextResponse } from 'next/server';
import apiService from '@/lib/api/apiService';
import { getToken } from '@/lib/api/auth';
import { getServiceAccountToken } from '@/lib/api/auth';

/**
 * Helper function to get authentication token from multiple sources
 */
const getAuthToken = async (request: Request): Promise<string | null> => {
    // First try to get from cookie/header
    const cookies = request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    // Check Authorization header as fallback
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.split(' ')[1];

    // Use token from cookie or header
    let finalToken = token || headerToken;

    // If no token is available, try to get a service account token
    if (!finalToken) {
        finalToken = await getServiceAccountToken();
    }

    return finalToken;
};

export async function GET(request: Request) {
    try {
        // Get authentication token
        const token = await getAuthToken(request);

        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required', message: 'Valid authentication token required' },
                { status: 401 }
            );
        }

        // Use the centralized API service with authentication
        const response = await apiService.get('/api/users', {
            params: { role: 'CLIENT' },
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.success) {
            return NextResponse.json(response.data);
        } else {
            // For development, provide mock data when real API fails
            if (process.env.NODE_ENV === 'development') {
                console.log('Returning mock client data for development');
                return NextResponse.json([
                    {
                        id: '55e6af3a-95b3-4225-83e6-8a2c7fe115e6',
                        username: 'client1',
                        email: 'client1@example.com',
                        full_name: 'Test Client',
                        company: 'Client Company 1'
                    },
                    {
                        id: 'a2c3e4b5-6d7e-8f9a-0b1c-2d3e4f5a6b7c',
                        username: 'client2',
                        email: 'client2@example.com',
                        full_name: 'Another Client',
                        company: 'Client Company 2'
                    }
                ]);
            }

            return NextResponse.json(
                {
                    error: response.error?.message || 'Failed to fetch clients',
                    details: response.error?.details
                },
                { status: response.error?.code || 500 }
            );
        }
    } catch (error) {
        console.error('Error in client fetch operation:', error);
        return NextResponse.json(
            { error: 'Failed to process client data request' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // Get authentication token
        const token = await getAuthToken(request);

        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required', message: 'Valid authentication token required' },
                { status: 401 }
            );
        }

        // Parse the request body
        const clientData = await request.json();
        const { username, password, email, company, full_name } = clientData;

        // Ensure client role is set
        const userData = {
            ...clientData,
            role: 'CLIENT' // Always uppercase for the backend
        };

        // Use the centralized API service to create the user
        const response = await apiService.post('/api/users', userData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.success) {
            // If client-specific fields are provided, update the user
            const userId = response.data.id;
            if (userId && (company || full_name)) {
                const updateData = { company, full_name };

                // Additional update for client-specific fields
                await apiService.patch(`/api/users/${userId}`, updateData, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Add the fields to the response data
                response.data.company = company;
                response.data.full_name = full_name;
            }

            return NextResponse.json(response.data, { status: 201 });
        } else {
            return NextResponse.json(
                {
                    error: response.error?.message || 'Failed to create client',
                    details: response.error?.details
                },
                { status: response.error?.code || 500 }
            );
        }
    } catch (error) {
        console.error('Error in client creation:', error);
        return NextResponse.json(
            { error: 'Failed to process client creation request' },
            { status: 500 }
        );
    }
}
