import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/api/adminClient';

export async function GET(request: Request) {
    try {
        // Get token from cookies
        const cookies = request.headers.get('cookie') || '';
        const tokenMatch = cookies.match(/token=([^;]+)/);
        const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

        // Also check Authorization header as fallback
        const authHeader = request.headers.get('Authorization');
        const headerToken = authHeader?.split(' ')[1];

        // Use token from cookie or header
        const finalToken = token || headerToken;

        if (!finalToken) {
            console.error('No valid token found in cookies or Authorization header');
            // Return empty array instead of error for smooth UI rendering
            return NextResponse.json([], { status: 200 });
        }

        // Use the final token in the Authorization header
        const vulnerabilities = await adminClient.get('/api/vulnerabilities/recent', undefined, {
            headers: {
                'Authorization': `Bearer ${finalToken}`
            }
        });

        return NextResponse.json(vulnerabilities);
    } catch (error: any) {
        console.error('Error fetching recent vulnerabilities:',
            error.details || error.message || 'Unknown error');

        // Return empty array instead of error for smooth UI rendering
        return NextResponse.json([], { status: 200 });
    }
}
