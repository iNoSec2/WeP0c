import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

export async function GET(request: Request) {
    try {
        // For demo purposes, always return mock data
        console.log('Returning mock projects data');
        
        return NextResponse.json([
            {
                id: 1,
                name: 'Web Application Security Assessment',
                description: 'Comprehensive security assessment of the client\'s web application.',
                client_id: 1,
                client_name: 'Acme Corp',
                status: 'IN_PROGRESS',
                start_date: '2023-01-15',
                end_date: '2023-02-15',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 2,
                name: 'Mobile App Security Review',
                description: 'Security review of the client\'s mobile application.',
                client_id: 2,
                client_name: 'TechStart Inc',
                status: 'PLANNED',
                start_date: '2023-03-01',
                end_date: '2023-03-15',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 3,
                name: 'Network Penetration Test',
                description: 'External and internal network penetration testing.',
                client_id: 1,
                client_name: 'Acme Corp',
                status: 'COMPLETED',
                start_date: '2022-11-01',
                end_date: '2022-11-30',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 4,
                name: 'API Security Assessment',
                description: 'Security assessment of the client\'s REST APIs.',
                client_id: 3,
                client_name: 'Global Finance',
                status: 'IN_PROGRESS',
                start_date: '2023-02-01',
                end_date: '2023-02-28',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 5,
                name: 'Cloud Infrastructure Security Review',
                description: 'Security review of AWS cloud infrastructure.',
                client_id: 2,
                client_name: 'TechStart Inc',
                status: 'PLANNED',
                start_date: '2023-04-01',
                end_date: '2023-04-30',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ]);
    } catch (error: any) {
        console.error('Error:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // For demo purposes, just return a success response
        console.log('Creating mock project');
        
        // Parse the request body
        const body = await request.json();
        
        // Return a mock response with the created project
        return NextResponse.json({
            id: 6,
            name: body.name || 'New Project',
            description: body.description || 'Project description',
            client_id: body.client_id || 1,
            client_name: 'Acme Corp',
            status: body.status || 'PLANNED',
            start_date: body.start_date || new Date().toISOString().split('T')[0],
            end_date: body.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating project:', error.message);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
}
