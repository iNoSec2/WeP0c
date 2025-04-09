import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

export async function GET(request: Request) {
    try {
        // For demo purposes, always return mock data
        console.log('Returning mock POCs data');
        
        return NextResponse.json([
            {
                id: 1,
                title: 'SQL Injection POC',
                description: 'Proof of concept for SQL injection vulnerability in the login form.',
                vulnerability_id: 1,
                vulnerability_name: 'SQL Injection',
                steps: [
                    'Navigate to the login page',
                    'Enter \' OR 1=1 -- in the username field',
                    'Leave the password field empty',
                    'Click the login button',
                    'Observe that you are logged in as the first user in the database'
                ],
                status: 'VERIFIED',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 2,
                title: 'XSS POC',
                description: 'Proof of concept for stored XSS vulnerability in the comment section.',
                vulnerability_id: 2,
                vulnerability_name: 'Cross-Site Scripting (XSS)',
                steps: [
                    'Navigate to the blog post page',
                    'Add a comment with the following content: <script>alert("XSS")</script>',
                    'Submit the comment',
                    'Reload the page',
                    'Observe that an alert box appears'
                ],
                status: 'VERIFIED',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 3,
                title: 'IDOR POC',
                description: 'Proof of concept for insecure direct object references vulnerability.',
                vulnerability_id: 3,
                vulnerability_name: 'Insecure Direct Object References',
                steps: [
                    'Login as a regular user',
                    'Navigate to your profile page',
                    'Observe the URL contains a user ID parameter',
                    'Change the user ID parameter to another value',
                    'Observe that you can access another user\'s profile'
                ],
                status: 'PENDING',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ]);
    } catch (error: any) {
        console.error('Error:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch POCs' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // For demo purposes, just return a success response
        console.log('Creating mock POC');
        
        // Parse the request body
        const body = await request.json();
        
        // Return a mock response with the created POC
        return NextResponse.json({
            id: 4,
            title: body.title || 'New POC',
            description: body.description || 'POC description',
            vulnerability_id: body.vulnerability_id || 1,
            vulnerability_name: 'SQL Injection',
            steps: body.steps || ['Step 1', 'Step 2', 'Step 3'],
            status: body.status || 'PENDING',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating POC:', error.message);
        return NextResponse.json(
            { error: 'Failed to create POC' },
            { status: 500 }
        );
    }
}
