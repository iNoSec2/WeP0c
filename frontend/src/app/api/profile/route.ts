import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

export async function GET(request: Request) {
    try {
        // Get token from request headers
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.split(' ')[1];

        // In development, use a default token if none is provided
        let effectiveToken = token;
        if (!effectiveToken && process.env.NODE_ENV === 'development') {
            effectiveToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjOGE2MGFlYi01N2ViLTQ0MmUtOTA1MS1kNzY5ZGUyOTlhOWEiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJleHAiOjE3NDQxMjUxMzh9.0oQ3zlw4FCIVXodMg9C4TV2jtRG4JtQZ6bE8pC2ZTBA";
            console.log('Using default development token for authentication');
        }

        if (!effectiveToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const backendURL = getBackendURL();
        console.log('Fetching user profile from:', `${backendURL}/api/users/me`);

        const response = await axios.get(`${backendURL}/api/users/me`, {
            headers: {
                Authorization: `Bearer ${effectiveToken}`
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: error.response?.data?.detail || 'Failed to fetch profile' },
            { status: error.response?.status || 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const data = await request.json();
        const backendURL = getBackendURL();

        const response = await axios.put(`${backendURL}/api/users/me`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: error.response?.data?.detail || 'Failed to update profile' },
            { status: error.response?.status || 500 }
        );
    }
}
