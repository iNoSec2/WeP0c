import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import axios from 'axios'
import { getBackendURL } from '@/lib/api'

export async function GET() {
    try {
        // Get token from cookies
        const token = cookies().get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Forward request to backend
        const backendURL = getBackendURL();
        const response = await axios.get(`${backendURL}/api/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user data' },
            { status: error.response?.status || 500 }
        );
    }
}