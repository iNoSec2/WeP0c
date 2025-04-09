import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { loginToBackend } from '@/lib/api/loginUtil';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        // First, login to get a valid token
        const authResponse = await loginToBackend();
        const token = authResponse.access_token;
        
        if (!token) {
            throw new Error('Failed to get authentication token');
        }
        
        console.log('Successfully obtained token for vulnerability details');
        
        const vulnerabilityId = params.id;
        const backendURL = getBackendURL();
        
        // Try different API endpoints to find the correct one
        let endpoint = `/api/vulnerabilities/${vulnerabilityId}`;
        let response;
        
        try {
            // First try the standard endpoint
            console.log('Trying endpoint:', `${backendURL}${endpoint}`);
            response = await axios.get(`${backendURL}${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            return NextResponse.json(response.data);
        } catch (firstError) {
            console.error('First endpoint failed, trying v1 endpoint');
            
            try {
                // If the first endpoint fails, try the v1 endpoint
                endpoint = `/api/v1/vulnerabilities/${vulnerabilityId}`;
                console.log('Trying endpoint:', `${backendURL}${endpoint}`);
                response = await axios.get(`${backendURL}${endpoint}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                return NextResponse.json(response.data);
            } catch (error: any) {
                console.error('Error fetching vulnerability details:', error);
                
                // For development, return mock data if the API fails
                if (process.env.NODE_ENV === 'development') {
                    console.log('Returning mock vulnerability data for development');
                    return NextResponse.json({
                        id: vulnerabilityId,
                        title: "Cross-Site Scripting (XSS) Vulnerability",
                        description_md: "## Cross-Site Scripting\n\nThis is a critical vulnerability that allows attackers to inject malicious scripts into web pages viewed by other users.\n\n### Impact\n\n- Steal user cookies and session tokens\n- Redirect users to malicious websites\n- Deface websites\n\n### Remediation\n\nImplement proper input validation and output encoding.",
                        poc_type: "python",
                        poc_code: "#!/usr/bin/env python3\n\nimport requests\n\ndef main():\n    print(\"Executing XSS POC...\")\n    payload = \"<script>alert('XSS');</script>\"\n    url = \"https://example.com/vulnerable-page\"\n    \n    try:\n        response = requests.get(url, params={\"input\": payload})\n        if payload in response.text:\n            print(\"Vulnerability confirmed!\")\n            print(f\"Payload: {payload}\")\n            return 0\n        else:\n            print(\"Target appears to be patched.\")\n            return 1\n    except Exception as e:\n        print(f\"Error: {e}\")\n        return 2\n\nif __name__ == \"__main__\":\n    exit(main())",
                        severity: "critical",
                        status: "open",
                        project_id: "1",
                        created_at: "2023-01-15T10:30:00Z",
                        updated_at: "2023-01-16T14:20:00Z",
                        created_by: {
                            id: "2",
                            full_name: "John Pentester"
                        }
                    });
                }
                
                return NextResponse.json(
                    { error: error.response?.data?.detail || 'Failed to fetch vulnerability details' },
                    { status: error.response?.status || 500 }
                );
            }
        }
    } catch (error: any) {
        console.error('Unexpected error in vulnerability details:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
