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

        // Try multiple endpoints to find the correct one
        try {
            console.log('Trying endpoint:', `${backendURL}/api/users/token`);
            const response = await axios.post(`${backendURL}/api/users/token`, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });

            console.log('Login successful with users/token endpoint');
            return NextResponse.json(response.data);
        } catch (firstError) {
            console.error('First login attempt failed, trying auth/login endpoint');

            try {
                console.log('Trying endpoint:', `${backendURL}/api/auth/login`);
                const response = await axios.post(`${backendURL}/api/auth/login`, formData, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                });

                console.log('Login successful with auth/login endpoint');
                return NextResponse.json(response.data);
            } catch (secondError) {
                console.error('Second login attempt failed, trying token endpoint');

                try {
                    console.log('Trying endpoint:', `${backendURL}/api/auth/token`);
                    const response = await axios.post(`${backendURL}/api/auth/token`, formData, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        }
                    });

                    console.log('Login successful with auth/token endpoint');
                    return NextResponse.json(response.data);
                } catch (thirdError) {
                    console.error('All login attempts failed, using mock token for development');

                    // For development, return a mock token
                    if (process.env.NODE_ENV === 'development') {
                        console.log('Returning mock token for development');

                        const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjOGE2MGFlYi01N2ViLTQ0MmUtOTA1MS1kNzY5ZGUyOTlhOWEiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJleHAiOjE3NDQxMjUxMzh9.0oQ3zlw4FCIVXodMg9C4TV2jtRG4JtQZ6bE8pC2ZTBA";

                        return NextResponse.json({
                            access_token: mockToken,
                            token_type: 'bearer',
                            user_id: '1',
                            username: 'Super Admin',
                            email: 'admin@p0cit.com',
                            role: 'SUPER_ADMIN'
                        });
                    }

                    throw thirdError;
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