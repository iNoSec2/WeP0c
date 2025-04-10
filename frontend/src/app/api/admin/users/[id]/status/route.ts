import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

// Helper function to get token from request
const getTokenFromRequest = (request: Request) => {
    const cookies = request.headers.get('cookie') || '';
    console.log('Admin users/status API - Full cookie string:', cookies);

    const tokenMatch = cookies.match(/token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

    // Also check Authorization header as fallback
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.split(' ')[1];

    console.log('Admin users/status API - Token extraction results:', {
        hasCookieToken: !!token,
        hasHeaderToken: !!headerToken,
        source: token ? 'cookie' : headerToken ? 'header' : 'none'
    });

    // Use token from cookie or header
    return token || headerToken;
};

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        // Get token from request
        const token = getTokenFromRequest(request);

        if (!token) {
            console.error('Admin users/status API - No token found in request');
            return NextResponse.json(
                { error: 'Authentication required. Please log in again.' },
                { status: 401 }
            );
        }

        const userId = params.id;
        const body = await request.json();
        console.log(`Admin users/status API - Updating status for user with ID: ${userId}`, body);

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

        // Add override headers for SUPER_ADMIN users
        if (userRole === 'SUPER_ADMIN') {
            console.log('Adding X-Override-Role header for SUPER_ADMIN user');
            headers['X-Override-Role'] = 'true';
            headers['X-Admin-Access'] = 'true';
            headers['X-Admin-Override'] = 'true';
        }

        // Call backend to update user status
        const backendURL = getBackendURL();
        const response = await axios.put(
            `${backendURL}/api/admin/users/${userId}`,
            { is_active: body.is_active },
            { headers }
        );

        // Return the updated user data
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Admin users/status API - Error:', error);

        // Get error details
        const status = error.response?.status || 500;
        const errorData = error.response?.data;

        return NextResponse.json(
            {
                error: errorData?.detail || 'Failed to update user status',
                details: errorData
            },
            { status }
        );
    }
}
