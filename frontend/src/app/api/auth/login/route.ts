import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        console.log('Attempting login with:', email);

        // For server-side API routes, always use the service name
        const backendURL = "http://api:8001";

        // The backend FastAPI uses OAuth2 password flow with form data
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        console.log('Trying login endpoint:', `${backendURL}/api/auth/login`);

        const response = await axios.post(`${backendURL}/api/auth/login`, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            validateStatus: function (status) {
                return status < 500; // Only treat 5xx responses as errors
            }
        });

        // Check for authentication failure
        if (response.status !== 200) {
            console.error('Authentication failed:', response.data);
            return NextResponse.json(
                { error: response.data?.detail || 'Authentication failed' },
                { status: response.status }
            );
        }

        console.log('Login successful with token length:', response.data.access_token?.length || 0);

        // Create response object
        const responseObj = NextResponse.json(response.data);

        // Set cookie for server-side auth with proper encoding and security
        responseObj.cookies.set({
            name: 'token',
            value: response.data.access_token,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            sameSite: 'lax',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        return responseObj;
    } catch (error: any) {
        console.error('Login error:', error.response?.data || error.message);
        return NextResponse.json(
            { error: error.response?.data?.detail || 'Authentication failed' },
            { status: error.response?.status || 401 }
        );
    }
}