import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';
import { loginToBackend } from '@/lib/api/loginUtil';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        // Get token from cookies if available
        const cookies = request.headers.get('cookie') || '';
        const tokenMatch = cookies.match(/token=([^;]+)/);
        const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

        // Also check Authorization header as fallback
        const authHeader = request.headers.get('Authorization');
        const headerToken = authHeader?.split(' ')[1];

        // Use token from cookie or header
        const finalToken = token || headerToken;

        let backendToken = finalToken;

        // If no token is available, try to login with service account
        if (!finalToken) {
            try {
                // Use environment variables for service account credentials
                const serviceEmail = process.env.SERVICE_ACCOUNT_EMAIL || 'admin@example.com';
                const servicePassword = process.env.SERVICE_ACCOUNT_PASSWORD || 'admin123';

                // Login to get a valid token
                const authResponse = await loginToBackend(serviceEmail, servicePassword);
                backendToken = authResponse.access_token;

                console.log('Successfully obtained service token for vulnerability details');
            } catch (loginError) {
                console.error('Failed to obtain service token:', loginError);
                return NextResponse.json(
                    { error: 'Authentication failed' },
                    { status: 401 }
                );
            }
        }

        if (!backendToken) {
            throw new Error('Failed to get authentication token');
        }

        const vulnerabilityId = params.id;
        const backendURL = getBackendURL();
        console.log(`Using backend URL: ${backendURL} to fetch vulnerability ${vulnerabilityId}`);

        // Special handling for 'create' route
        if (vulnerabilityId === 'create') {
            console.log('Detected "create" route - returning mock data for form initialization');
            return NextResponse.json({
                id: '',
                title: '',
                description_md: '',
                poc_type: 'python',
                poc_code: '',
                severity: 'medium',
                status: 'open',
                project_id: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        // Try different API endpoints to find the correct one
        // Use explicit IPv4 address for direct connections (not for SSR)
        const directBackendURL = typeof window === 'undefined' ?
            'http://api:8001' :
            'http://127.0.0.1:8001';

        try {
            // Try the direct vulnerability endpoint first
            console.log(`Trying to fetch vulnerability ${vulnerabilityId} from backend`);
            const response = await axios.get(`${backendURL}/api/vulnerabilities/${vulnerabilityId}`, {
                headers: {
                    'Authorization': `Bearer ${backendToken}`
                }
            });

            return NextResponse.json(response.data);
        } catch (error: any) {
            console.error('Error fetching vulnerability details:', error.message);

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
    } catch (error: any) {
        console.error('Unexpected error in vulnerability details:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
