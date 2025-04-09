import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

export async function GET(request: Request) {
    try {
        // For demo purposes, always return mock data
        console.log('Returning mock recent vulnerabilities data');
        
        return NextResponse.json([
            {
                id: 1,
                name: 'SQL Injection',
                description: 'A SQL injection vulnerability in the login form allows attackers to bypass authentication.',
                severity: 'HIGH',
                status: 'OPEN',
                project_id: 1,
                project_name: 'Web Application Security Assessment',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 2,
                name: 'Cross-Site Scripting (XSS)',
                description: 'A stored XSS vulnerability in the comment section allows attackers to inject malicious scripts.',
                severity: 'MEDIUM',
                status: 'IN_PROGRESS',
                project_id: 1,
                project_name: 'Web Application Security Assessment',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 3,
                name: 'Insecure Direct Object References',
                description: 'The application does not properly validate access to resources, allowing unauthorized access to data.',
                severity: 'LOW',
                status: 'CLOSED',
                project_id: 2,
                project_name: 'Mobile App Security Review',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ]);
    } catch (error: any) {
        console.error('Error:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch recent vulnerabilities' },
            { status: 500 }
        );
    }
}
