'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import axios from 'axios'
import { loginToBackend } from '@/lib/api/loginUtil'
import { Role } from '@/types/user'

interface User {
    id: number
    email: string
    full_name: string
    role: Role
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
    hasPermission: (requiredRoles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to set a cookie
function setCookie(name: string, value: string, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

// Public routes that don't require authentication
const PUBLIC_PATHS = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth/microsoft/callback'
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isRedirecting, setIsRedirecting] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    // Setup axios interceptor for auth headers
    useEffect(() => {
        // Set up the response interceptor to handle 401 responses
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    // Auto logout on 401 unauthorized responses
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            // Clean up the interceptor when the component unmounts
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    useEffect(() => {
        // Skip if we're currently in the middle of a redirect
        if (isRedirecting) return;

        // Check if user is logged in on mount or pathname change
        const checkAuth = async () => {
            setIsLoading(true)
            try {
                // Check for token in localStorage
                const token = localStorage.getItem('token')
                const storedUser = localStorage.getItem('user')

                if (token && storedUser) {
                    // Set up axios default headers for authenticated requests
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

                    // Parse and set user state
                    setUser(JSON.parse(storedUser))

                    // Make sure token is also in cookies for SSR middleware
                    setCookie('token', token);

                    // Only redirect to dashboard if on login page
                    // This prevents redirect loops
                    if (pathname === '/login') {
                        console.log('Already logged in, redirecting from login to dashboard');
                        setIsRedirecting(true);
                        router.push('/dashboard');
                    }
                } else if (!PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path))) {
                    // If no auth and not on public page, redirect to login
                    // But don't redirect if we're already on login or another public page
                    console.log('No auth found, redirecting to login');
                    setIsRedirecting(true);
                    router.push('/login');
                }
            } catch (err) {
                console.error('Authentication error:', err)
                setError('Authentication failed')
                clearAuthData();
            } finally {
                setIsLoading(false)
                // Reset redirecting state after a delay
                setTimeout(() => setIsRedirecting(false), 300);
            }
        }

        checkAuth()
    }, [pathname, router, isRedirecting])

    // Function to clear all auth data
    const clearAuthData = () => {
        setUser(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        localStorage.removeItem('access_token')
        delete axios.defaults.headers.common['Authorization']
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    }

    const login = async (email: string, password: string) => {
        setIsLoading(true)
        setError(null)

        try {
            console.log('Starting login process...');
            // Pass email and password to the loginToBackend function
            const authResponse = await loginToBackend(email, password);
            console.log('Auth response received:', authResponse);

            // Create a user object from the response
            const userObj: User = {
                id: parseInt(authResponse.user_id),
                email: authResponse.email,
                full_name: authResponse.username,
                role: authResponse.role.toLowerCase() as Role,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            console.log('Created user object:', userObj);

            // Update state and localStorage
            setUser(userObj)
            localStorage.setItem('user', JSON.stringify(userObj))

            // Set up axios default headers for authenticated requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${authResponse.access_token}`

            // Also set token as cookie for SSR
            setCookie('token', authResponse.access_token);

            // Prevent redirect loops by setting a flag
            setIsRedirecting(true);

            console.log('Starting dashboard redirect...');
            // Use the router (which will be caught by the middleware)
            router.push('/dashboard');

            // Reset the redirecting flag after navigation
            setTimeout(() => setIsRedirecting(false), 500);

            return;
        } catch (err) {
            console.error('Login error:', err)
            setError('Login failed')
            throw err;
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        clearAuthData();

        // Prevent redirect loops
        setIsRedirecting(true);

        // Redirect to login
        router.push('/login');

        // Reset the redirecting flag after navigation
        setTimeout(() => setIsRedirecting(false), 500);
    }

    // Helper function to check if user has required role(s)
    const hasPermission = (requiredRoles: Role[]) => {
        if (!user) return false;

        // Super admin can access everything
        if (user.role === 'super_admin') return true;

        // Check if user's role is in the required roles array
        return requiredRoles.includes(user.role);
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, error, login, logout, hasPermission }}>
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