import { NextResponse } from 'next/server';

// This is a placeholder for Microsoft authentication
// In a production environment, you would implement proper OAuth2 flow with Microsoft
export async function GET() {
    try {
        // Construct the API URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

        // Redirect to backend OAuth endpoint
        return NextResponse.redirect(`${apiUrl}/auth/microsoft/login`);
    } catch (error) {
        console.error('Microsoft auth error:', error);
        // Redirect to login page with error
        return NextResponse.redirect('/login?error=microsoft_auth_failed');
    }
} 