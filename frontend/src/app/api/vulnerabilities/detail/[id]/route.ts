import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { extractTokenFromRequest } from '@/lib/api/serverAuth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const vulnerabilityId = params.id;
        console.log(`Fetching vulnerability details from /detail endpoint for ID: ${vulnerabilityId}`);

        // Extract token from request
        const token = extractTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        // Extract role from token for role-based permissions
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        const userRole = payload.role;

        // Create headers with role override for super admins
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        if (userRole === 'SUPER_ADMIN') {
            console.log('Adding X-Override-Role header for SUPER_ADMIN user');
            headers['X-Override-Role'] = 'true';
        }

        // Forward request to backend
        const backendURL = getBackendURL();

        try {
            // Forward to the main vulnerability endpoint
            console.log(`Forwarding to main endpoint: ${backendURL}/api/vulnerabilities/${vulnerabilityId}`);
            const response = await axios.get(
                `${backendURL}/api/vulnerabilities/${vulnerabilityId}`,
                { headers }
            );

            return NextResponse.json(response.data);
        } catch (error: any) {
            console.error(`Error fetching vulnerability from main endpoint: ${vulnerabilityId}`, error);

            return NextResponse.json(
                { error: error.response?.data?.detail || 'Failed to fetch vulnerability details' },
                { status: error.response?.status || 404 }
            );
        }
    } catch (error) {
        console.error('Unexpected error in vulnerability detail route:', error);

        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
