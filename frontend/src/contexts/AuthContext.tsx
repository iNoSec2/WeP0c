'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'
import { loginToBackend } from '@/lib/api/loginUtil'
import { useRouter } from 'next/navigation'

interface User {
    id: number
    email: string
    full_name: string
    role: string
    is_active: boolean
    company?: string
    bio?: string
    avatar_url?: string
    theme?: string
    last_login?: string
    created_at: string
    updated_at: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    error: string | null
    login: (email: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        // Check if user is logged in on mount
        const checkAuth = async () => {
            setIsLoading(true)
            try {
                // In a real app, verify token/session with backend
                const storedUser = localStorage.getItem('user')
                if (storedUser) {
                    setUser(JSON.parse(storedUser))
                }
            } catch (err) {
                console.error('Authentication error:', err)
                setError('Authentication failed')
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [])

    const login = async (email: string, password: string) => {
        setIsLoading(true)
        setError(null)

        try {
            // Use the loginToBackend utility
            const authResponse = await loginToBackend(email, password);

            // Create a user object from the response
            const userObj: User = {
                id: parseInt(authResponse.user_id),
                email: authResponse.email,
                full_name: authResponse.username,
                role: authResponse.role.toLowerCase(),
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Update state and localStorage
            setUser(userObj)
            localStorage.setItem('user', JSON.stringify(userObj))

            // Redirect to dashboard
            router.push('/dashboard')
        } catch (err) {
            console.error('Login error:', err)
            setError('Login failed')

            // For development, try with default credentials
            if (process.env.NODE_ENV === 'development') {
                try {
                    console.log('Trying default login for development');
                    const authResponse = await loginToBackend();

                    // Create a user object from the response
                    const userObj: User = {
                        id: parseInt(authResponse.user_id),
                        email: authResponse.email,
                        full_name: authResponse.username,
                        role: authResponse.role.toLowerCase(),
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };

                    // Update state and localStorage
                    setUser(userObj)
                    localStorage.setItem('user', JSON.stringify(userObj))

                    // Redirect to dashboard
                    router.push('/dashboard')
                } catch (devError) {
                    console.error('Development login failed:', devError);
                }
            }
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        localStorage.removeItem('access_token')
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext