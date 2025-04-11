import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { extractTokenFromRequest } from '@/lib/api/serverAuth';
import { UserRole } from '@/lib/api/users';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Get vulnerability ID from route params
        const vulnerabilityId = params.id;
        console.log(`Fetching vulnerability details for ID: ${vulnerabilityId}`);

        // Extract token from request
        const token = extractTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        // Extract role from token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        const userRole = payload.role;

        // Generate headers
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Add override headers for SUPER_ADMIN and ADMIN users
        if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
            console.log(`Adding override headers for ${userRole} user`);
            headers['X-Override-Role'] = 'true';
            headers['X-Admin-Access'] = 'true';
            headers['X-Admin-Override'] = 'true';

            // Log the headers for debugging
            console.log('Request headers:', headers);
        }

        // Forward request to backend
        const backendURL = getBackendURL();

        try {
            console.log(`Fetching vulnerability from: ${backendURL}/api/vulnerabilities/${vulnerabilityId}`);
            const response = await axios.get(
                `${backendURL}/api/vulnerabilities/${vulnerabilityId}`,
                { headers }
            );
            return NextResponse.json(response.data);
        } catch (error: any) {
            console.error(`Error fetching vulnerability: ${vulnerabilityId}`, error);

            return NextResponse.json(
                { error: error.response?.data?.detail || 'Failed to fetch vulnerability details' },
                { status: error.response?.status || 404 }
            );
        }
    } catch (error) {
        console.error('Unexpected error in vulnerability route:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Get vulnerability ID from route params
        const vulnerabilityId = params.id;
        console.log(`Deleting vulnerability with ID: ${vulnerabilityId}`);

        // Extract token from request
        const token = extractTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        // Extract role from token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        const userRole = payload.role;

        // Generate headers
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Add override headers for SUPER_ADMIN and ADMIN users
        if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
            console.log(`Adding override headers for ${userRole} user`);
            headers['X-Override-Role'] = 'true';
            headers['X-Admin-Access'] = 'true';
            headers['X-Admin-Override'] = 'true';

            // Log the headers for debugging
            console.log('Request headers:', headers);
        }

        // Forward request to backend
        const backendURL = getBackendURL();

        try {
            console.log(`Deleting vulnerability at: ${backendURL}/api/vulnerabilities/${vulnerabilityId}`);
            await axios.delete(
                `${backendURL}/api/vulnerabilities/${vulnerabilityId}`,
                { headers }
            );
            return NextResponse.json({ message: 'Vulnerability deleted successfully' });
        } catch (error: any) {
            console.error(`Error deleting vulnerability: ${vulnerabilityId}`, error);

            return NextResponse.json(
                { error: error.response?.data?.detail || 'Failed to delete vulnerability' },
                { status: error.response?.status || 500 }
            );
        }
    } catch (error) {
        console.error('Unexpected error in vulnerability delete route:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Get vulnerability ID from route params
        const vulnerabilityId = params.id;
        console.log(`Updating vulnerability with ID: ${vulnerabilityId}`);

        // Extract token from request
        const token = extractTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        // Extract role from token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        const userRole = payload.role;

        // Parse request body
        const vulnerabilityData = await request.json();
        console.log('Vulnerability update data:', vulnerabilityData);

        // Generate headers
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Add override headers for SUPER_ADMIN and ADMIN users
        if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
            console.log(`Adding override headers for ${userRole} user`);
            headers['X-Override-Role'] = 'true';
            headers['X-Admin-Access'] = 'true';
            headers['X-Admin-Override'] = 'true';

            // Log the headers for debugging
            console.log('Request headers:', headers);
        }

        // Forward request to backend
        const backendURL = getBackendURL();

        try {
            console.log(`Updating vulnerability at: ${backendURL}/api/vulnerabilities/${vulnerabilityId}`);
            const response = await axios.put(
                `${backendURL}/api/vulnerabilities/${vulnerabilityId}`,
                vulnerabilityData,
                { headers }
            );
            return NextResponse.json(response.data);
        } catch (error: any) {
            console.error(`Error updating vulnerability: ${vulnerabilityId}`, error);

            return NextResponse.json(
                { error: error.response?.data?.detail || 'Failed to update vulnerability' },
                { status: error.response?.status || 500 }
            );
        }
    } catch (error) {
        console.error('Unexpected error in vulnerability update route:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}