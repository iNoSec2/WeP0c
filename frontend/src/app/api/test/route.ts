import { NextResponse } from 'next/server';
import { userRoutes, projectRoutes } from '@/lib/api/routes';

export async function GET() {
    // Return the centralized routes for validation
    return NextResponse.json({
        userRoutes,
        projectRoutes,
        message: 'API routes loaded successfully',
        timestamp: new Date().toISOString()
    });
} 