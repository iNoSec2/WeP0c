import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { loginToBackend } from '@/lib/api/loginUtil';

export async function POST(request: Request) {
    try {
        // First, login to get a valid token
        const authResponse = await loginToBackend();
        const token = authResponse.access_token;

        if (!token) {
            throw new Error('Failed to get authentication token');
        }

        console.log('Successfully obtained token for init-db');

        // Call the backend to initialize the database
        const backendURL = getBackendURL();
        console.log('Initializing database at:', `${backendURL}/api/admin/init-db`);

        const response = await axios.post(`${backendURL}/api/admin/init-db`, {
            recreate_tables: false
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return NextResponse.json({
            message: "Database initialized with default users and project",
            details: response.data
        });
    } catch (error: any) {
        console.error('Error initializing database:', error);
        return NextResponse.json(
            { error: error.response?.data?.detail || 'Failed to initialize database' },
            { status: error.response?.status || 500 }
        );
    }
}