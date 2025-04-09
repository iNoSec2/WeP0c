import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

// This endpoint is used to initialize the database with default data
export async function POST(request: Request) {
    try {
        // Get the authorization cookie or header from the request
        let token = '';

        // Try to get from cookies first
        const cookieStore = cookies();
        const authCookie = cookieStore.get('token') || cookieStore.get('access_token');
        if (authCookie) {
            token = authCookie.value;
        } else {
            // Try to get from authorization header
            const authHeader = request.headers.get('authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        // Construct the API URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

        // Call the backend init endpoint
        const response = await axios.post(
            `${apiUrl}/admin/init-db`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to initialize database:', error);
        return NextResponse.json(
            { error: error.response?.data?.detail || 'Failed to initialize database' },
            { status: 500 }
        );
    }
}