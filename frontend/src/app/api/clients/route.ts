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

        // Forward request to backend
        const backendURL = getBackendURL();
        console.log('Fetching clients from:', `${backendURL}/api/users/clients`);

        const response = await axios.get(`${backendURL}/api/users/clients`, {
            headers: {
                Authorization: `Bearer ${finalToken}`
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching clients:', error);

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
            { status: error.response?.status || 500 }
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
        const { username, password, email, company } = body;

        // Forward request to backend
        const backendURL = getBackendURL();
        console.log('Creating client:', { username, email, company });

        const response = await axios.post(`${backendURL}/api/users/clients`, {
            username,
            password,
            email
        }, {
            headers: {
                Authorization: `Bearer ${finalToken}`,
                'Content-Type': 'application/json'
            }
        });

        return NextResponse.json(response.data, { status: 201 });
    } catch (error: any) {
        console.error('Error creating client:', error);
        return NextResponse.json(
            { error: error.response?.data?.detail || 'Failed to create client' },
            { status: error.response?.status || 500 }
        );
    }
}
