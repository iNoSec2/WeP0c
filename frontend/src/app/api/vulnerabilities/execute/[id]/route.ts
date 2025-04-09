import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { loginToBackend } from '@/lib/api/loginUtil';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        // First, login to get a valid token
        const authResponse = await loginToBackend();
        const token = authResponse.access_token;
        
        if (!token) {
            throw new Error('Failed to get authentication token');
        }
        
        console.log('Successfully obtained token for executing POC');
        
        const vulnerabilityId = params.id;
        const backendURL = getBackendURL();
        
        // Try different API endpoints to find the correct one
        let endpoint = `/api/vulnerabilities/execute/${vulnerabilityId}`;
        let response;
        
        try {
            // First try the standard endpoint
            console.log('Trying endpoint:', `${backendURL}${endpoint}`);
            response = await axios.post(`${backendURL}${endpoint}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            return NextResponse.json(response.data);
        } catch (firstError) {
            console.error('First endpoint failed, trying v1 endpoint');
            
            try {
                // If the first endpoint fails, try the v1 endpoint
                endpoint = `/api/v1/vulnerabilities/execute/${vulnerabilityId}`;
                console.log('Trying endpoint:', `${backendURL}${endpoint}`);
                response = await axios.post(`${backendURL}${endpoint}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                return NextResponse.json(response.data);
            } catch (error: any) {
                console.error('Error executing POC:', error);
                
                // For development, return mock data if the API fails
                if (process.env.NODE_ENV === 'development') {
                    console.log('Returning mock POC execution data for development');
                    return NextResponse.json({
                        vulnerability_id: vulnerabilityId,
                        success: true,
                        output: "Mock POC execution successful!\n\nVulnerability confirmed.\nTarget is vulnerable to XSS attack.\n\nPayload: <script>alert('XSS')</script>",
                        exit_code: 0
                    });
                }
                
                return NextResponse.json(
                    { error: error.response?.data?.detail || 'Failed to execute POC' },
                    { status: error.response?.status || 500 }
                );
            }
        }
    } catch (error: any) {
        console.error('Unexpected error in POC execution:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
