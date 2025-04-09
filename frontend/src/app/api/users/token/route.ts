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
            // Try the users/token endpoint
            const response = await axios.post(`${backendURL}/api/users/token`, apiFormData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
            
            console.log('Login successful with users/token endpoint');
            return NextResponse.json(response.data);
        } catch (firstError) {
            console.error('First login attempt failed, trying auth/login endpoint');
            
            try {
                // If that fails, try the auth/login endpoint
                const response = await axios.post(`${backendURL}/api/auth/login`, apiFormData, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                });
                
                console.log('Login successful with auth/login endpoint');
                return NextResponse.json(response.data);
            } catch (secondError) {
                console.error('Second login attempt failed, trying auth/token endpoint');
                
                try {
                    // If that fails too, try the auth/token endpoint
                    const response = await axios.post(`${backendURL}/api/auth/token`, apiFormData, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        }
                    });
                    
                    console.log('Login successful with auth/token endpoint');
                    return NextResponse.json(response.data);
                } catch (thirdError) {
                    console.error('All login attempts failed');
                    
                    // For development, return a mock token
                    if (process.env.NODE_ENV === 'development') {
                        console.log('Returning mock token for development');
                        
                        return NextResponse.json({
                            access_token: "demo-token",
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
