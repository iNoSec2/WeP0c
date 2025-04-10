import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { loginToBackend } from '@/lib/api/loginUtil';

// Define multiple backend URLs to try in order of preference
const BACKEND_URLS = [
    'http://127.0.0.1:8001',  // Explicit IPv4 address - avoids IPv6 issues
    'http://api:8001',        // Docker service name
    process.env.NEXT_PUBLIC_API_URL || '' // Environment variable fallback
].filter(Boolean); // Remove empty entries

export async function GET(request: Request) {
    try {
        // Get URL parameters
        const url = new URL(request.url);
        const skip = url.searchParams.get('skip') || '0';
        const limit = url.searchParams.get('limit') || '100';

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

        // Try each backend URL until one works
        let lastError = null;
        for (const backendURL of BACKEND_URLS) {
            try {
                console.log(`Trying to fetch clients from: ${backendURL}/api/users/clients?skip=${skip}&limit=${limit}`);

                const response = await axios.get(`${backendURL}/api/users/clients`, {
                    params: {
                        skip,
                        limit
                    },
                    headers: {
                        Authorization: `Bearer ${finalToken}`
                    },
                    timeout: 5000 // 5 second timeout
                });

                console.log(`Successfully fetched ${response.data.length} clients from ${backendURL}`);
                return NextResponse.json(response.data);
            } catch (error) {
                console.log(`Failed to fetch clients from ${backendURL}:`, error.message);
                lastError = error;
                // Continue to next URL
            }
        }

        // If we get here, all URLs failed
        console.error('All backend URLs failed to fetch clients', lastError);

        // Return proper error response
        const status = lastError?.response?.status || 500;
        const message = lastError?.response?.data?.detail || 'Failed to fetch clients';

        return NextResponse.json(
            { error: message },
            { status: status }
        );
    } catch (error) {
        console.error('Error in clients endpoint:', error);

        // Return proper error response
        return NextResponse.json(
            { error: 'Failed to process request' },
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
        const { username, password, email, company } = body;

        // Try each backend URL until one works
        let lastError = null;
        for (const backendURL of BACKEND_URLS) {
            try {
                console.log(`Trying to create client on: ${backendURL}/api/users/clients`);
                console.log('Client data:', { username, email, company });

                const response = await axios.post(`${backendURL}/api/users/clients`, {
                    username,
                    password,
                    email,
                    company
                }, {
                    headers: {
                        Authorization: `Bearer ${finalToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 8000 // 8 second timeout for POST requests
                });

                console.log(`Successfully created client at ${backendURL}`);
                return NextResponse.json(response.data, { status: 201 });
            } catch (error) {
                console.log(`Failed to create client at ${backendURL}:`, error.message);
                if (error.response) {
                    console.log('Error details:', error.response.status, error.response.data);
                }
                lastError = error;
                // Continue to next URL
            }
        }

        // If we get here, all URLs failed
        console.error('All backend URLs failed to create client', lastError);

        // Return proper error response
        const status = lastError?.response?.status || 500;
        const message = lastError?.response?.data?.detail || 'Failed to create client';

        return NextResponse.json(
            { error: message, details: lastError?.response?.data },
            { status: status }
        );
    } catch (error) {
        console.error('Error in create client endpoint:', error);

        // Return proper error response
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
} 