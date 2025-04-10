"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Edit, Trash2, UserPlus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { Role } from "@/types/user";
import { apiClient } from '@/lib/network';
import { usersService } from '@/lib/api/users';
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function UsersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Fetch users with proper error handling
    const { data: users = [], isLoading, isError, error } = useQuery({
        queryKey: ["users", roleFilter],
        queryFn: async () => {
            try {
                let endpoint = '/api/admin/users';
                if (roleFilter !== "all") {
                    endpoint += `?role=${roleFilter}`;
                }

                console.log(`Fetching users from ${endpoint}`);

                // Use direct API call to our admin users endpoint
                const response = await axios.get(endpoint, {
                    withCredentials: true,
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });

                console.log(`Received ${response.data.length} users from admin API`);

                // Clear any previous connection errors
                setConnectionError(null);
                return response.data;
            } catch (err: any) {
                console.error("Error fetching users:", err);

                // Check for connection errors
                if (err.isConnectionError) {
                    setConnectionError(err.friendlyMessage || "Failed to connect to backend service");
                } else if (err.response?.status === 503) {
                    setConnectionError(err.response.data.error || "Backend service unavailable");
                } else if (err.response?.status === 401) {
                    setConnectionError("Authentication failed. Please log in again.");
                    // Force refresh login page after a short delay
                    setTimeout(() => {
                        router.push('/login');
                    }, 3000);
                } else {
                    const errorMessage = err.response?.data?.error || err.response?.data?.message ||
                        "Failed to fetch users. Please try again.";

                    toast({
                        title: "Error",
                        description: errorMessage,
                        variant: "destructive",
                    });
                }
                throw err;
            }
        },
        refetchOnWindowFocus: false
    });

    // Re-fetch when role filter changes
    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
    }, [roleFilter, queryClient]);

    // Delete user mutation with improved error handling
    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            try {
                // Use direct API call to admin endpoint for deleting users
                await axios.delete(`/api/admin/users/${userId}`, {
                    withCredentials: true
                });
            } catch (err: any) {
                // Check for connection errors
                if (err.isConnectionError) {
                    setConnectionError(err.friendlyMessage || "Failed to connect to backend service");
                    throw new Error("Backend connection error. Please try again later.");
                } else if (err.response?.status === 503) {
                    setConnectionError(err.response.data.error || "Backend service unavailable");
                    throw new Error("Backend service unavailable. Please try again later.");
                } else if (err.response?.status === 401) {
                    setConnectionError("Authentication failed. Please log in again.");
                    // Force refresh login page after a short delay
                    setTimeout(() => {
                        router.push('/login');
                    }, 2000);
                    throw new Error("Authentication failed. Please log in again.");
                }

                const errorMessage = err.response?.data?.error || err.response?.data?.message ||
                    "Failed to delete user. Please try again.";
                throw new Error(errorMessage);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast({
                title: "User deleted",
                description: "The user has been successfully deleted.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete user. Please try again.",
                variant: "destructive",
            });
        },
    });

    // Filter users based on search term and role filter
    const filteredUsers = users.filter((user: any) => {
        // Handle case where username or email might be undefined
        const username = user.username?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch = username.includes(searchLower) || email.includes(searchLower);

        // Convert both to lowercase to ensure case-insensitive comparison
        const userRole = user.role?.toLowerCase() || '';
        const filterRole = roleFilter.toLowerCase();

        // If "all" is selected, show all users, otherwise filter by role
        const matchesRole = filterRole === "all" || userRole === filterRole;

        return matchesSearch && matchesRole;
    });

    // Handle delete user
    const handleDeleteUser = (user: any) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteUser = () => {
        if (selectedUser) {
            deleteUserMutation.mutate(selectedUser.id);
        }
    };

    // Get role badge color
    const getRoleBadgeColor = (role: string) => {
        // Convert to lowercase for consistent comparison
        const roleLower = role?.toLowerCase() || '';

        switch (roleLower) {
            case Role.SUPER_ADMIN.toLowerCase():
                return "bg-purple-100 text-purple-800";
            case Role.ADMIN.toLowerCase():
                return "bg-red-100 text-red-800";
            case Role.PENTESTER.toLowerCase():
                return "bg-blue-100 text-blue-800";
            case Role.CLIENT.toLowerCase():
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (connectionError) {
        return (
            <DashboardLayout>
                <div className="container p-6 mx-auto">
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold">User Management</h1>
                        </div>
                        <div className="p-6 bg-red-50 border border-red-200 rounded-md">
                            <h3 className="text-lg font-semibold text-red-800 mb-2">Backend Connection Error</h3>
                            <p className="text-red-800 mb-4">{connectionError}</p>
                            <Button
                                onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
                                variant="outline"
                            >
                                Retry Connection
                            </Button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (isError) {
        return (
            <DashboardLayout>
                <div className="container p-6 mx-auto">
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold">User Management</h1>
                        </div>
                        <div className="p-6 bg-red-50 border border-red-200 rounded-md">
                            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Users</h3>
                            <p className="text-red-800 mb-4">Could not load user data. Please try again later.</p>
                            <Button
                                onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
                                variant="outline"
                            >
                                Retry
                            </Button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container p-6 mx-auto">
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <Button onClick={() => router.push("/users/create")}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value={Role.SUPER_ADMIN}>Super Admin</SelectItem>
                                <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                                <SelectItem value={Role.PENTESTER}>Pentester</SelectItem>
                                <SelectItem value={Role.CLIENT}>Client</SelectItem>
                                <SelectItem value={Role.USER}>User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-pulse">Loading users...</div>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user: any) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.username || 'N/A'}</TableCell>
                                            <TableCell>{user.email || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge className={getRoleBadgeColor(user.role)}>
                                                    {user.role || 'Unknown'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.is_active ? "default" : "outline"}>
                                                    {user.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.push(`/users/${user.id}/edit`)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteUser(user)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10">
                            <p className="text-lg text-center mb-4">No users found</p>
                            <Button onClick={() => router.push("/users/create")}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDeleteUser}
                title="Delete User"
                description={`Are you sure you want to delete ${selectedUser?.username || "this user"}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </DashboardLayout>
    );
} 