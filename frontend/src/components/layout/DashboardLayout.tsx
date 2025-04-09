'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'
import {
    LayoutDashboard,
    Users,
    FileText,
    AlertCircle,
    Settings,
    Menu,
    LogOut,
    ChevronDown,
    ChevronRight,
    User,
    Shield,
    X
} from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback } from '../ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, logout } = useAuth()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Projects', href: '/projects', icon: FileText },
        { name: 'Pentests', href: '/pentests', icon: Shield },
        { name: 'Users', href: '/users', icon: Users },
        { name: 'Settings', href: '/settings', icon: Settings },
    ]

    const handleLogout = () => {
        logout()
        router.push('/auth/login')
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out",
                !isSidebarOpen && "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-border">
                        <Link href="/dashboard" className="text-xl font-bold">
                            P0cit
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname.startsWith(item.href)
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {typeof item.name === 'string' ? item.name : 'Menu Item'}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium">JD</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">John Doe</p>
                                <p className="text-xs text-muted-foreground">Admin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={cn(
                "transition-all duration-200 ease-in-out",
                isSidebarOpen ? "pl-64" : "pl-0"
            )}>
                {/* Top Bar */}
                <div className="h-16 border-b border-border bg-card">
                    <div className="h-full px-4 flex items-center justify-between">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-accent rounded-md"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <div className="flex items-center space-x-4">
                            {/* Add notifications, search, etc. here */}
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}