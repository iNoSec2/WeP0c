import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MoonIcon, SunIcon, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
    toggleTheme: () => void;
    isDarkMode: boolean;
}

export function Header({ toggleTheme, isDarkMode }: HeaderProps) {
    const { user, logout } = useAuth();

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase();
    };

    return (
        <header className="flex h-14 items-center border-b bg-background px-4 lg:px-6">
            <div className="flex flex-1 items-center justify-between">
                <div></div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        {isDarkMode ? (
                            <SunIcon className="h-5 w-5" />
                        ) : (
                            <MoonIcon className="h-5 w-5" />
                        )}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Notifications</span>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{user?.username && typeof user.username === 'string' ? getInitials(user.username) : "U"}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.username && typeof user.username === 'string' ? user.username : 'User'}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email && typeof user.email === 'string' ? user.email : 'user@example.com'}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className="text-red-500">
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}