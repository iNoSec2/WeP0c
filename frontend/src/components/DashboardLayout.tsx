"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    FileText,
    Home,
    LogOut,
    PlusCircle,
    Settings,
    Shield,
    User,
    Users,
} from "lucide-react";
import { isSuperAdmin, isAdmin, isPentester, isClient } from "@/lib/utils/permissions";
import ProtectedRoute from "./ProtectedRoute";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string;
        title: string;
        icon: React.ReactNode;
    }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
    const pathname = usePathname();

    return (
        <nav className={cn("flex flex-col space-y-1", className)} {...props}>
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href || pathname?.startsWith(item.href + '/')
                            ? "bg-accent text-accent-foreground"
                            : "transparent"
                    )}
                >
                    <span className="mr-2 h-4 w-4 flex-shrink-0">{item.icon}</span>
                    <span className="truncate menu-item">{typeof item.title === 'string' ? item.title : 'Menu Item'}</span>
                </Link>
            ))}
        </nav>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // Initialize with no role, we'll get the actual role from localStorage or token
    const [userRole, setUserRole] = React.useState<string>("");

    React.useEffect(() => {
        console.log('DashboardLayout: Getting user role');

        // First try to get the role from user data in localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.role) {
                    console.log('Found role in user data:', user.role);
                    setUserRole(user.role);
                    return;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        // If that fails, try to get the role from the token
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (token) {
            try {
                // Decode the JWT token to get user information
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const { role } = JSON.parse(jsonPayload);
                if (role) {
                    console.log('Found role in token:', role);
                    setUserRole(role);

                    // Save the role to localStorage for consistency
                    const userObj = { role };
                    localStorage.setItem('user', JSON.stringify(userObj));
                    return;
                }
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }

        // If we still don't have a role, redirect to login
        console.log('No role found, redirecting to login');
        window.location.href = '/login';
    }, []);

    // Shared dashboard items
    const dashboardNavItems = [
        {
            title: "Dashboard",
            href: "/dashboard",
            icon: <Home className="h-4 w-4" />,
        },
        {
            title: "Projects",
            href: "/projects",
            icon: <FileText className="h-4 w-4" />,
        },
    ];

    // Define all possible menu items
    const adminItems = [
        {
            title: "Admin Dashboard",
            href: "/admin/dashboard",
            icon: <BarChart3 className="h-4 w-4" />,
        },
        {
            title: "Users Management",
            href: "/admin/users",
            icon: <Users className="h-4 w-4" />,
        },
        {
            title: "Projects Management",
            href: "/admin/projects",
            icon: <FileText className="h-4 w-4" />,
        },
        {
            title: "System Settings",
            href: "/admin/settings",
            icon: <Settings className="h-4 w-4" />,
        },
    ];

    const pentesterItems = [
        {
            title: "Vulnerabilities",
            href: "/vulnerabilities",
            icon: <Shield className="h-4 w-4" />,
        },
        {
            title: "Pentests",
            href: "/pentests",
            icon: <BarChart3 className="h-4 w-4" />,
        },
    ];

    const clientItems = [
        {
            title: "Security Reports",
            href: "/reports",
            icon: <FileText className="h-4 w-4" />,
        },
    ];

    // Role-specific items based on user role
    let roleSpecificItems: Array<{ title: string, href: string, icon: React.ReactNode }> = [];

    // Super admin gets access to everything
    if (isSuperAdmin(userRole)) {
        console.log('User is super_admin, adding all admin items');
        roleSpecificItems = [
            // Put admin items first for super_admin
            ...adminItems,
            ...pentesterItems,
            ...clientItems
        ];
    }
    // Admin gets admin items
    else if (isAdmin(userRole)) {
        roleSpecificItems = adminItems;
    }
    // Pentester gets pentester items
    else if (isPentester(userRole)) {
        roleSpecificItems = pentesterItems;
    }
    // Client gets client items
    else if (isClient(userRole)) {
        roleSpecificItems = clientItems;
    }

    // Add a console log to debug the items
    console.log('Role-specific items:', roleSpecificItems.map(item => item.title));

    // Combine all nav items
    const navItems = [...dashboardNavItems, ...roleSpecificItems];

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen flex-col">
                {/* Top Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
                    <div className="flex flex-1 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link href="/" className="flex items-center">
                                <span className="text-xl font-bold">P0cit</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/profile">
                                    <User className="h-4 w-4" />
                                    <span className="sr-only">Profile</span>
                                </Link>
                            </Button>
                            <Button variant="outline" size="icon">
                                <Settings className="h-4 w-4" />
                                <span className="sr-only">Settings</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    // Remove all auth-related items
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('access_token');
                                    localStorage.removeItem('user');
                                    localStorage.removeItem('user_data');
                                    console.log('User logged out, redirecting to login');
                                    window.location.href = '/login';
                                }}
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="sr-only">Logout</span>
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="flex flex-1">
                    {/* Side Navigation */}
                    <aside className="w-64 border-r bg-background overflow-auto">
                        <div className="flex h-full flex-col gap-6 p-6">
                            <div className="flex items-center gap-2">
                                <Button className="w-full justify-start" asChild>
                                    <Link href="/projects/create">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        New Project
                                    </Link>
                                </Button>
                            </div>
                            <div className="sidebar-nav-container">
                                <SidebarNav items={navItems} />
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">{children}</main>
                </div>
            </div>
        </ProtectedRoute>
    );
}