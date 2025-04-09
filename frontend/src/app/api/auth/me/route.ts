import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
    try {
        const cookieStore = cookies()
        const token = cookieStore.get('token')

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        // Make request to backend API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token.value}`,
            },
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch user data' },
                { status: response.status }
            )
        }

        const userData = await response.json()
        return NextResponse.json(userData)
    } catch (error) {
        console.error('Error fetching user data:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 