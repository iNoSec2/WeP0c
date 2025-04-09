'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Loading } from '@/components/ui/loading'
import { useToast } from '@/components/ui/use-toast'
import axios from 'axios'
import { Database } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { login, isLoading: authLoading, error: authError } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Use the AuthContext login function
            await login(formData.email, formData.password);

            // Show success message
            toast({
                title: 'Login successful',
                description: 'Welcome back!',
            });

            // The redirect is handled in the AuthContext
        } catch (error) {
            console.error('Login error:', error);

            // Show error message
            toast({
                title: 'Login failed',
                description: 'Invalid email or password. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false)
        }
    }

    const handleInitializeDatabase = async () => {
        try {
            setIsInitializing(true)
            const response = await axios.post('/api/init-db')

            toast({
                title: 'Database initialized',
                description: 'Default users and project have been created successfully.',
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to initialize database',
                variant: 'destructive',
            })
        } finally {
            setIsInitializing(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg"
            >
                <div className="text-center">
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold text-gray-900"
                    >
                        Welcome to P0cit
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-2 text-sm text-gray-600"
                    >
                        Penetration Testing Management Platform
                    </motion.p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            />
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loading size="sm" variant="primary" />
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </motion.div>
                </form>

                {/* Admin tools hidden in production */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleInitializeDatabase}
                            disabled={isInitializing}
                            className="mt-4 w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                            <Database className="h-4 w-4 text-gray-500 mr-2" />
                            {isInitializing ? 'Initializing Database...' : 'Initialize Database'}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    )
}