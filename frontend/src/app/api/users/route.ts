import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendURL } from '@/lib/api';

export async function GET(request: Request) {
    try {
        // For demo purposes, always return mock data
        console.log('Returning mock users data');
        
        return NextResponse.json([
            {
                id: 1,
                email: 'admin@p0cit.com',
                full_name: 'Super Admin',
                role: 'super_admin',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 2,
                email: 'pentester@p0cit.com',
                full_name: 'Pen Tester',
                role: 'pentester',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 3,
                email: 'client@acmecorp.com',
                full_name: 'Client User',
                role: 'client',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ]);
    } catch (error: any) {
        console.error('Error:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // For demo purposes, just return a success response
        console.log('Creating mock user');
        
        // Parse the request body
        const body = await request.json();
        
        // Return a mock response with the created user
        return NextResponse.json({
            id: 4,
            email: body.email || 'new.user@example.com',
            full_name: body.full_name || 'New User',
            role: body.role || 'pentester',
            is_active: body.is_active !== undefined ? body.is_active : true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating user:', error.message);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
