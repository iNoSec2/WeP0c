import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Shield,
    Bug,
    Settings,
    LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navigationItems = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Users",
        href: "/users",
        icon: Users,
    },
    {
        name: "Projects",
        href: "/projects",
        icon: FolderKanban,
    },
    {
        name: "Pentests",
        href: "/pentests",
        icon: Shield,
    },
    {
        name: "Vulnerabilities",
        href: "/vulnerabilities",
        icon: Bug,
    },
    {
        name: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

export function Navigation() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <nav className="flex flex-col gap-2 p-4">
            {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                    </Link>
                );
            })}
            <Button
                variant="ghost"
                className="mt-auto flex items-center gap-3"
                onClick={logout}
            >
                <LogOut className="h-4 w-4" />
                Logout
            </Button>
        </nav>
    );
} 