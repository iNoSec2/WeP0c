import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        console.log('Attempting login with:', username);

        const backendURL = getBackendURL();
        console.log('Login endpoint:', `${backendURL}/api/users/token`);

        // Create form data for backend
        const apiFormData = new URLSearchParams();
        apiFormData.append('username', username);
        apiFormData.append('password', password);

        try {
            // Direct login
            console.log('Attempting direct login to backend...');
            const response = await axios.post(`${backendURL}/api/auth/login/access-token`, formData);
            console.log('Login successful!');

            return NextResponse.json(response.data);
        } catch (firstError) {
            console.error('First login attempt failed:', firstError.message);

            try {
                // Try API token endpoint
                console.log('Trying alternative login endpoint...');
                const tokenResponse = await axios.post(`${backendURL}/api/token`, formData);
                console.log('Alternative login successful!');

                return NextResponse.json(tokenResponse.data);
            } catch (secondError) {
                console.error('Second login attempt failed:', secondError.message);

                try {
                    // Try OAuth token endpoint
                    console.log('Trying OAuth endpoint...');
                    const oauthResponse = await axios.post(`${backendURL}/api/auth/token`, formData);
                    console.log('OAuth login successful!');

                    return NextResponse.json(oauthResponse.data);
                } catch (thirdError) {
                    console.error('All login attempts failed');

                    // No more fallbacks, report authentication failure
                    throw new Error('Authentication failed across all endpoints');
                }
            }
        }
    } catch (error: any) {
        console.error('Login error:', error);

        return NextResponse.json(
            { error: error.response?.data?.detail || 'Authentication failed' },
            { status: error.response?.status || 500 }
        );
    }
}
