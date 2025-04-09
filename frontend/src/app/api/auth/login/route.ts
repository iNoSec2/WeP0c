import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        console.log('Attempting login with:', email);

        const backendURL = getBackendURL();

        // The backend expects form data with username/password fields
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        console.log('Trying endpoint:', `${backendURL}/api/auth/login`);
        const response = await axios.post(`${backendURL}/api/auth/login`, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        console.log('Login successful with auth/login endpoint');

        // Set cookie for server-side auth
        const responseObj = NextResponse.json(response.data);
        responseObj.cookies.set({
            name: 'token',
            value: response.data.access_token,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            sameSite: 'lax',
            httpOnly: true
        });

        return responseObj;
    } catch (error: any) {
        console.error('Login error:', error.response?.data);
        return NextResponse.json(
            { error: error.response?.data?.detail || 'Authentication failed' },
            { status: error.response?.status || 401 }
        );
    }
}