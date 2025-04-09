import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { loginToBackend } from '@/lib/api/loginUtil';

export async function GET(request: Request) {
    try {
        // For demo purposes, always return mock data
        console.log('Returning mock vulnerabilities data');
        return NextResponse.json([
            {
                id: "1",
                title: "Cross-Site Scripting (XSS) Vulnerability",
                severity: "critical",
                status: "open",
                project_id: "1",
                project: { name: "E-commerce Platform" },
                created_at: "2023-01-15T10:30:00Z"
            },
            {
                id: "2",
                title: "SQL Injection in Login Form",
                severity: "high",
                status: "in_progress",
                project_id: "1",
                project: { name: "E-commerce Platform" },
                created_at: "2023-01-20T14:15:00Z"
            },
            {
                id: "3",
                title: "Insecure Direct Object Reference",
                severity: "medium",
                status: "open",
                project_id: "2",
                project: { name: "Banking Application" },
                created_at: "2023-02-05T09:45:00Z"
            }
        ]);
    }

            return NextResponse.json(
        { error: error.response?.data?.detail || 'Failed to fetch vulnerabilities' },
        { status: error.response?.status || 500 }
    );
}
    }
    } catch (error: any) {
    console.error('Unexpected error in vulnerabilities list:', error);
    return NextResponse.json(
        { error: 'An unexpected error occurred' },
        { status: 500 }
    );
}
}

export async function POST(request: Request) {
    try {
        // First, login to get a valid token
        const authResponse = await loginToBackend();
        const token = authResponse.access_token;

        if (!token) {
            throw new Error('Failed to get authentication token');
        }

        console.log('Successfully obtained token for creating vulnerability');

        const data = await request.json();
        const backendURL = getBackendURL();

        // Try different API endpoints to find the correct one
        let endpoint = `/api/vulnerabilities`;
        let response;

        try {
            // First try the standard endpoint
            console.log('Trying POST endpoint:', `${backendURL}${endpoint}`);
            response = await axios.post(`${backendURL}${endpoint}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return NextResponse.json(response.data);
        } catch (firstError) {
            console.error('First POST endpoint failed, trying v1 endpoint');

            try {
                // If the first endpoint fails, try the v1 endpoint
                endpoint = `/api/v1/vulnerabilities`;
                console.log('Trying POST endpoint:', `${backendURL}${endpoint}`);
                response = await axios.post(`${backendURL}${endpoint}`, data, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                return NextResponse.json(response.data);
            } catch (error: any) {
                console.error('Error creating vulnerability:', error);
                return NextResponse.json(
                    { error: error.response?.data?.detail || 'Failed to create vulnerability' },
                    { status: error.response?.status || 500 }
                );
            }
        }
    } catch (error: any) {
        console.error('Unexpected error in creating vulnerability:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}