import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard,
    Folder,
    ShieldAlert,
    Users,
    FileText,
    Settings,
    LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const isActive = (path: string) => {
        return pathname?.startsWith(path);
    };

    // Different navigation items based on user role
    const navigationItems = () => {
        if (!user) return [];

        const commonItems = [
            {
                title: "Dashboard",
                href: "/dashboard",
                icon: <LayoutDashboard className="h-5 w-5" />,
            },
            {
                title: "Projects",
                href: "/projects",
                icon: <Folder className="h-5 w-5" />,
            },
        ];

        // Super admin specific items
        if (user.role === "super_admin") {
            return [
                ...commonItems,
                {
                    title: "Admin Dashboard",
                    href: "/admin/dashboard",
                    icon: <LayoutDashboard className="h-5 w-5" />,
                },
                {
                    title: "User Management",
                    href: "/admin/users",
                    icon: <Users className="h-5 w-5" />,
                },
                {
                    title: "Projects Management",
                    href: "/admin/projects",
                    icon: <Folder className="h-5 w-5" />,
                },
                {
                    title: "Vulnerabilities",
                    href: "/vulnerabilities",
                    icon: <ShieldAlert className="h-5 w-5" />,
                },
                {
                    title: "Clients",
                    href: "/clients",
                    icon: <Users className="h-5 w-5" />,
                },
                {
                    title: "Reports",
                    href: "/reports",
                    icon: <FileText className="h-5 w-5" />,
                },
                {
                    title: "System Settings",
                    href: "/admin/settings",
                    icon: <Settings className="h-5 w-5" />,
                },
            ];
        }

        // Pentester specific items
        if (user.role === "pentester") {
            return [
                ...commonItems,
                {
                    title: "Vulnerabilities",
                    href: "/vulnerabilities",
                    icon: <ShieldAlert className="h-5 w-5" />,
                },
                {
                    title: "Clients",
                    href: "/clients",
                    icon: <Users className="h-5 w-5" />,
                },
                {
                    title: "Reports",
                    href: "/reports",
                    icon: <FileText className="h-5 w-5" />,
                },
                {
                    title: "Settings",
                    href: "/settings",
                    icon: <Settings className="h-5 w-5" />,
                },
            ];
        }

        // Client items
        return [
            ...commonItems,
            {
                title: "Vulnerabilities",
                href: "/vulnerabilities",
                icon: <ShieldAlert className="h-5 w-5" />,
            },
            {
                title: "Reports",
                href: "/reports",
                icon: <FileText className="h-5 w-5" />,
            },
            {
                title: "Settings",
                href: "/settings",
                icon: <Settings className="h-5 w-5" />,
            },
        ];
    };

    return (
        <aside className={cn("flex h-screen w-64 flex-col bg-slate-100 dark:bg-slate-900", className)}>
            <div className="flex h-14 items-center border-b px-4">
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <ShieldAlert className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">P0cit</span>
                </Link>
            </div>
            <nav className="flex-1 overflow-auto p-3">
                <ul className="space-y-2">
                    {navigationItems().map((item) => (
                        <li key={item.href}>
                            <Link href={item.href} passHref>
                                <Button
                                    variant={isActive(item.href) ? "default" : "ghost"}
                                    className={cn(
                                        "w-full justify-start",
                                        isActive(item.href) ? "bg-primary text-primary-foreground" : ""
                                    )}
                                >
                                    {item.icon}
                                    <span className="ml-3">{typeof item.title === 'string' ? item.title : 'Menu Item'}</span>
                                </Button>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="border-t p-3">
                <div className="flex items-center mb-3 px-2 py-1.5">
                    <div className="ml-2">
                        <p className="text-sm font-medium">{user?.username || 'User'}</p>
                        <p className="text-xs text-slate-500">{typeof user?.role === 'string' ? user.role : 'User'}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900"
                    onClick={logout}
                >
                    <LogOut className="h-5 w-5" />
                    <span className="ml-3">Logout</span>
                </Button>
            </div>
        </aside>
    );
}