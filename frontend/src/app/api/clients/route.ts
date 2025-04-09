import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

export async function GET(request: Request) {
    try {
        // For demo purposes, always return mock data
        console.log('Returning mock clients data');
        
        return NextResponse.json([
            {
                id: 1,
                name: 'Acme Corp',
                contact_name: 'John Smith',
                contact_email: 'john.smith@acmecorp.com',
                contact_phone: '+1 (555) 123-4567',
                address: '123 Main St, San Francisco, CA 94105',
                industry: 'Technology',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 2,
                name: 'TechStart Inc',
                contact_name: 'Jane Doe',
                contact_email: 'jane.doe@techstart.com',
                contact_phone: '+1 (555) 987-6543',
                address: '456 Market St, San Francisco, CA 94105',
                industry: 'Finance',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 3,
                name: 'Global Finance',
                contact_name: 'Robert Johnson',
                contact_email: 'robert.johnson@globalfinance.com',
                contact_phone: '+1 (555) 456-7890',
                address: '789 Broadway, New York, NY 10003',
                industry: 'Finance',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ]);
    } catch (error: any) {
        console.error('Error:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch clients' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // For demo purposes, just return a success response
        console.log('Creating mock client');
        
        // Parse the request body
        const body = await request.json();
        
        // Return a mock response with the created client
        return NextResponse.json({
            id: 4,
            name: body.name || 'New Client',
            contact_name: body.contact_name || 'Contact Name',
            contact_email: body.contact_email || 'contact@example.com',
            contact_phone: body.contact_phone || '+1 (555) 555-5555',
            address: body.address || '123 Example St, City, State 12345',
            industry: body.industry || 'Technology',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating client:', error.message);
        return NextResponse.json(
            { error: 'Failed to create client' },
            { status: 500 }
        );
    }
}
