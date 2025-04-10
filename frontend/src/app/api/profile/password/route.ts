import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

export async function POST(request: Request) {
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
        
        const response = await axios.post(`${backendURL}/api/users/me/password`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error changing password:', error);
        return NextResponse.json(
            { error: error.response?.data?.detail || 'Failed to change password' },
            { status: error.response?.status || 500 }
        );
    }
}
