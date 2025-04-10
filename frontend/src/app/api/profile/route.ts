import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

export async function GET(request: Request) {
    try {
        // Get token from request headers
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const backendURL = getBackendURL();
        console.log('Fetching user profile from:', `${backendURL}/api/users/me`);

        const response = await axios.get(`${backendURL}/api/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`
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
