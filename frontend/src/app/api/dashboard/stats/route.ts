import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

export async function GET(request: Request) {
    try {
        // Get token from request headers
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.split(' ')[1];

        const backendURL = getBackendURL();
        console.log('Fetching dashboard stats from:', `${backendURL}/api/dashboard/stats`);
        console.log('Authorization token present:', token ? 'Yes' : 'No');

        // Prepare headers with token if available
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else if (process.env.NODE_ENV === 'development') {
            // In development, use a default token if none is provided
            const defaultDevToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjOGE2MGFlYi01N2ViLTQ0MmUtOTA1MS1kNzY5ZGUyOTlhOWEiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJleHAiOjE3NDQxMjUxMzh9.0oQ3zlw4FCIVXodMg9C4TV2jtRG4JtQZ6bE8pC2ZTBA";
            headers['Authorization'] = `Bearer ${defaultDevToken}`;
            console.log('Using default development token for authentication');
        }

        // Forward the request to the backend with the token
        const response = await axios.get(`${backendURL}/api/dashboard/stats`, { headers });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);

        // For development, return mock data if the API fails
        if (process.env.NODE_ENV === 'development') {
            console.log('Returning mock dashboard stats data');
            return NextResponse.json({
                projects: {
                    total: 5,
                    by_status: {
                        "in_progress": 2,
                        "completed": 1,
                        "planned": 2
                    }
                },
                vulnerabilities: {
                    total: 12
                },
                users: {
                    total: 10,
                    by_role: {
                        "super_admin": 1,
                        "admin": 2,
                        "pentester": 3,
                        "client": 4
                    }
                },
                recentActivities: [
                    {
                        id: "1",
                        type: "vulnerability",
                        description: "New critical vulnerability reported",
                        timestamp: new Date().toISOString(),
                        status: "open"
                    },
                    {
                        id: "2",
                        type: "project",
                        description: "E-commerce security audit completed",
                        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                        status: "completed"
                    },
                    {
                        id: "3",
                        type: "pentest",
                        description: "New penetration test started",
                        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                        status: "in_progress"
                    }
                ]
            });
        }

        return NextResponse.json(
            { error: error.response?.data?.detail || 'Failed to fetch dashboard stats' },
            { status: error.response?.status || 500 }
        );
    }
}
