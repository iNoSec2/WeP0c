"use client";

import { useState } from "react";
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

export default function UsersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    // Fetch users
    const { data: users = [], isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
                { withCredentials: true }
            );
            return response.data;
        },
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
                { withCredentials: true }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast({
                title: "User deleted",
                description: "The user has been successfully deleted.",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to delete user. Please try again.",
                variant: "destructive",
            });
            console.error("Error deleting user:", error);
        },
    });

    // Filter users based on search term and role filter
    const filteredUsers = users.filter((user: any) => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Handle delete user
    const handleDeleteUser = (userId: string) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            deleteUserMutation.mutate(userId);
        }
    };

    // Get role badge color
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case Role.ADMIN:
                return "bg-red-100 text-red-800";
            case Role.PENTESTER:
                return "bg-blue-100 text-blue-800";
            case Role.CLIENT:
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

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
                                <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                                <SelectItem value={Role.PENTESTER}>Pentester</SelectItem>
                                <SelectItem value={Role.CLIENT}>Client</SelectItem>
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
                                            <TableCell className="font-medium">{user.username}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge className={getRoleBadgeColor(user.role)}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.is_active ? "default" : "outline"}>
                                                    {user.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(user.created_at).toLocaleDateString()}
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
                                                        onClick={() => handleDeleteUser(user.id)}
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
        </DashboardLayout>
    );
} 