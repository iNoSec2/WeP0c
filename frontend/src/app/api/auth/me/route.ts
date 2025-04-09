import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
    try {
        // For demo purposes, always return mock user data
        console.log('Returning mock user data');

        return NextResponse.json({
            id: 1,
            email: 'admin@p0cit.com',
            full_name: 'Super Admin',
            role: 'super_admin',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}