import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { loginToBackend } from '@/lib/api/loginUtil';

export async function GET(request: Request) {
    try {
        // First, login to get a valid token
        const authResponse = await loginToBackend();
        const token = authResponse.access_token;

        if (!token) {
            throw new Error('Failed to get authentication token');
        }

        console.log('Successfully obtained token for projects API');

        const backendURL = getBackendURL();
        console.log('Fetching projects from backend');

        // Forward the request to the backend with the token
        // Try different API endpoints to find the correct one
        let endpoint = `/api/projects`;
        let response;

        try {
            // First try the standard endpoint
            console.log('Trying endpoint:', `${backendURL}${endpoint}`);
            response = await axios.get(`${backendURL}${endpoint}`, {
                headers: token ? {
                    Authorization: `Bearer ${token}`
                } : {}
            });

            return NextResponse.json(response.data);
        } catch (firstError) {
            console.error('First endpoint failed, trying v1 endpoint');

            try {
                // If the first endpoint fails, try the v1 endpoint
                endpoint = `/api/v1/projects`;
                console.log('Trying endpoint:', `${backendURL}${endpoint}`);
                response = await axios.get(`${backendURL}${endpoint}`, {
                    headers: token ? {
                        Authorization: `Bearer ${token}`
                    } : {}
                });

                return NextResponse.json(response.data);
            } catch (secondError) {
                console.error('Second endpoint failed, trying projects/projects endpoint');

                // If the second endpoint fails, try the projects/projects endpoint
                endpoint = `/api/projects/projects/`;
                console.log('Trying endpoint:', `${backendURL}${endpoint}`);
                response = await axios.get(`${backendURL}${endpoint}`, {
                    headers: token ? {
                        Authorization: `Bearer ${token}`
                    } : {}
                });

                return NextResponse.json(response.data);
            }
        }
    } catch (error: any) {
        console.error('Error fetching projects:', error);

        // For development, return mock data if the API fails
        if (process.env.NODE_ENV === 'development') {
            console.log('Returning mock project data for development');
            return NextResponse.json([
                {
                    id: "1",
                    name: "E-commerce Platform Security Audit",
                    description: "Comprehensive security assessment of the e-commerce platform",
                    status: "in_progress",
                    start_date: "2023-01-15",
                    end_date: "2023-02-15",
                    client: { name: "Acme Corp" }
                },
                {
                    id: "2",
                    name: "Banking Application Penetration Test",
                    description: "In-depth penetration testing of the banking application",
                    status: "planned",
                    start_date: "2023-03-01",
                    end_date: "2023-03-15",
                    client: { name: "SecureBank Inc" }
                },
                {
                    id: "3",
                    name: "Healthcare Portal Security Review",
                    description: "Security review of the healthcare portal",
                    status: "completed",
                    start_date: "2022-11-01",
                    end_date: "2022-11-30",
                    client: { name: "HealthFirst" }
                }
            ]);
        }

        return NextResponse.json(
            { error: error.response?.data?.detail || 'Failed to fetch projects' },
            { status: error.response?.status || 500 }
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

        console.log('Successfully obtained token for creating project');

        const data = await request.json();
        const backendURL = getBackendURL();

        // Try different API endpoints to find the correct one
        let endpoint = `/api/projects`;
        let response;

        try {
            // First try the standard endpoint
            console.log('Trying POST endpoint:', `${backendURL}${endpoint}`);
            response = await axios.post(`${backendURL}${endpoint}`, data, {
                headers: token ? {
                    Authorization: `Bearer ${token}`
                } : {}
            });

            return NextResponse.json(response.data);
        } catch (firstError) {
            console.error('First POST endpoint failed, trying v1 endpoint');

            try {
                // If the first endpoint fails, try the v1 endpoint
                endpoint = `/api/v1/projects`;
                console.log('Trying POST endpoint:', `${backendURL}${endpoint}`);
                response = await axios.post(`${backendURL}${endpoint}`, data, {
                    headers: token ? {
                        Authorization: `Bearer ${token}`
                    } : {}
                });

                return NextResponse.json(response.data);
            } catch (secondError) {
                console.error('Second POST endpoint failed, trying projects/projects endpoint');

                // If the second endpoint fails, try the projects/projects endpoint
                endpoint = `/api/projects/projects/`;
                console.log('Trying POST endpoint:', `${backendURL}${endpoint}`);
                response = await axios.post(`${backendURL}${endpoint}`, data, {
                    headers: token ? {
                        Authorization: `Bearer ${token}`
                    } : {}
                });

                return NextResponse.json(response.data);
            }
        }
    } catch (error: any) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: error.response?.data?.detail || 'Failed to create project' },
            { status: error.response?.status || 500 }
        );
    }
}