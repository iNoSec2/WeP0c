import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { loginToBackend } from '@/lib/api/loginUtil';

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
        let finalToken = token || headerToken;

        // If no token is available, try to login with service account
        if (!finalToken) {
            try {
                // Use environment variables for service account credentials
                const serviceEmail = process.env.SERVICE_ACCOUNT_EMAIL || 'admin@example.com';
                const servicePassword = process.env.SERVICE_ACCOUNT_PASSWORD || 'admin123';

                // Login to get a valid token
                const authResponse = await loginToBackend(serviceEmail, servicePassword);
                finalToken = authResponse.access_token;

                console.log('Successfully obtained service token for client operations');
            } catch (loginError) {
                console.error('Failed to obtain service token:', loginError);
                return NextResponse.json(
                    { error: 'Authentication failed' },
                    { status: 401 }
                );
            }
        }

        if (!finalToken) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        // Forward request to backend - try multiple endpoints for robustness
        const backendURL = 'http://api:8001'; // Always use Docker service name
        const endpoints = [
            `${backendURL}/api/users/clients`,
            `${backendURL}/api/users?role=client`
        ];

        let lastError = null;

        // Try each endpoint until one works
        for (const endpoint of endpoints) {
            try {
                console.log(`Fetching clients from: ${endpoint}`);

                const response = await axios.get(endpoint, {
                    headers: {
                        Authorization: `Bearer ${finalToken}`
                    }
                });

                console.log(`Successfully fetched clients from ${endpoint}`);

                // Transform the response data to handle UUID validation issues
                if (Array.isArray(response.data)) {
                    const transformedData = response.data.map(client => ({
                        ...client,
                        // Ensure ID is a string
                        id: client.id ? client.id.toString() : client.id,
                        // Add placeholder for missing updated_at
                        updated_at: client.updated_at || client.created_at || new Date().toISOString()
                    }));
                    return NextResponse.json(transformedData);
                }

                return NextResponse.json(response.data);
            } catch (error) {
                console.error(`Error fetching clients from ${endpoint}:`, error);
                lastError = error;
                // Continue to next endpoint
            }
        }

        // If we reach here, all endpoints failed
        console.error('All endpoints failed for client data fetching');

        // For development, return mock client data if API fails
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
            { error: 'Failed to fetch clients' },
            { status: lastError?.response?.status || 500 }
        );
    } catch (error: any) {
        console.error('Error fetching clients:', error);
        return NextResponse.json(
            { error: 'Failed to fetch clients' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // Get token from cookies
        const cookies = request.headers.get('cookie') || '';
        const tokenMatch = cookies.match(/token=([^;]+)/);
        const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

        // Also check Authorization header as fallback
        const authHeader = request.headers.get('Authorization');
        const headerToken = authHeader?.split(' ')[1];

        // Use token from cookie or header
        let finalToken = token || headerToken;

        // If no token is available, try to login with service account
        if (!finalToken) {
            try {
                // Use environment variables for service account credentials
                const serviceEmail = process.env.SERVICE_ACCOUNT_EMAIL || 'admin@example.com';
                const servicePassword = process.env.SERVICE_ACCOUNT_PASSWORD || 'admin123';

                // Login to get a valid token
                const authResponse = await loginToBackend(serviceEmail, servicePassword);
                finalToken = authResponse.access_token;

                console.log('Successfully obtained service token for client operations');
            } catch (loginError) {
                console.error('Failed to obtain service token:', loginError);
                return NextResponse.json(
                    { error: 'Authentication failed' },
                    { status: 401 }
                );
            }
        }

        if (!finalToken) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        // Parse the request body
        const body = await request.json();
        const { username, password, email, company, full_name } = body;

        // Use a simpler approach - create a standard user with client role
        const backendURL = 'http://api:8001'; // Always use Docker service name

        try {
            console.log('Creating client user:', { username, email, role: 'CLIENT' });

            // Create a new user with the client role (always uppercase)
            const response = await axios.post(`${backendURL}/api/users`, {
                username,
                password,
                email,
                role: 'CLIENT' // Always use uppercase for role
            }, {
                headers: {
                    Authorization: `Bearer ${finalToken}`,
                    'Content-Type': 'application/json'
                },
                validateStatus: function (status) {
                    // Don't throw for 4xx errors so we can handle them
                    return status < 500;
                }
            });

            // Check for error responses
            if (response.status >= 400) {
                const errorMessage = response.data?.detail || 'Failed to create client';

                // Special handling for common errors
                if (response.status === 400 &&
                    (response.data?.detail === 'Username already registered' ||
                        response.data?.detail === 'Email already registered')) {
                    return NextResponse.json(
                        {
                            error: response.data.detail,
                            message: "This username or email is already in use. Please try a different one."
                        },
                        { status: 400 }
                    );
                }

                return NextResponse.json(
                    { error: errorMessage },
                    { status: response.status }
                );
            }

            // If additional client fields are provided, update the user
            const userId = response.data.id;
            if (userId && (company || full_name)) {
                console.log(`Updating client ${userId} with additional fields`);
                await axios.patch(`${backendURL}/api/users/${userId}`, {
                    company,
                    full_name
                }, {
                    headers: {
                        Authorization: `Bearer ${finalToken}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            // Transform the response data to handle UUID validation issues
            const transformedData = {
                ...response.data,
                id: response.data.id ? response.data.id.toString() : response.data.id,
                updated_at: response.data.updated_at || response.data.created_at || new Date().toISOString(),
                company,
                full_name
            };

            return NextResponse.json(transformedData, { status: 201 });
        } catch (error: any) {
            console.error('Error creating client:', error);

            const errorMessage = error.response?.data?.detail || 'Failed to create client';
            const statusCode = error.response?.status || 500;

            return NextResponse.json({
                error: errorMessage,
                message: "Unable to create client. Please verify the information and try again."
            }, { status: statusCode });
        }
    } catch (error: any) {
        console.error('Error processing client creation request:', error);
        return NextResponse.json(
            { error: 'Failed to process client creation request' },
            { status: 500 }
        );
    }
}
