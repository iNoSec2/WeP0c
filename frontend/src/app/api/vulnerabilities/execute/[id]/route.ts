import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { loginToBackend } from '@/lib/api/loginUtil';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        // Get the vulnerability ID from the URL
        const vulnerabilityId = params.id;

        // Get token from cookies if available
        const cookies = request.headers.get('cookie') || '';
        const tokenMatch = cookies.match(/token=([^;]+)/);
        const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

        // Also check Authorization header as fallback
        const authHeader = request.headers.get('Authorization');
        const headerToken = authHeader?.split(' ')[1];

        // Use token from cookie or header
        const finalToken = token || headerToken;

        if (!finalToken) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid token found' },
                { status: 401 }
            );
        }

        // Forward request to backend
        try {
            const backendURL = getBackendURL();
            console.log(`Executing POC for vulnerability ${vulnerabilityId}`);

            const response = await axios.post(
                `${backendURL}/api/vulnerabilities/execute/${vulnerabilityId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${finalToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`POC execution successful:`, {
                success: response.data.success,
                exit_code: response.data.exit_code
            });

            return NextResponse.json(response.data);
        } catch (error: any) {
            console.error('Error executing POC:', error);

            return NextResponse.json(
                { error: error.response?.data?.detail || 'Failed to execute POC' },
                { status: error.response?.status || 500 }
            );
        }
    } catch (error: any) {
        console.error('Unexpected error in POC execution:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
