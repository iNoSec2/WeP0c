"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { PlusCircle, Search, Edit, Trash2, UserPlus } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

function AdminUsersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "client",
    });
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: users = [], isLoading } = useQuery<User[]>({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await axios.get("/api/admin/users");
            return response.data;
        },
        staleTime: 60000,
        retry: 1,
    });

    const createUserMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const response = await axios.post("/api/admin/users", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setIsCreateDialogOpen(false);
            setFormData({
                username: "",
                email: "",
                password: "",
                role: "client",
            });
            toast({
                title: "User created",
                description: "The user has been successfully created.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to create user",
                variant: "destructive",
            });
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            await axios.delete(`/api/admin/users/${userId}/`);
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
                description: error.response?.data?.detail || "Failed to delete user",
                variant: "destructive",
            });
        },
    });

    const toggleUserStatusMutation = useMutation({
        mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
            await axios.patch(`/api/admin/users/${userId}/status/`, { is_active: !isActive });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast({
                title: "User status updated",
                description: "The user status has been successfully updated.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to update user status",
                variant: "destructive",
            });
        },
    });

    const filteredUsers = users.filter((user) => {
        const username = user.username?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const searchTermLower = searchTerm.toLowerCase();

        return username.includes(searchTermLower) ||
            email.includes(searchTermLower);
    });

    const getRoleBadge = (role: string) => {
        switch (role.toLowerCase()) {
            case "admin":
                return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
            case "pentester":
                return <Badge className="bg-blue-100 text-blue-800">Pentester</Badge>;
            case "client":
                return <Badge className="bg-green-100 text-green-800">Client</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{role}</Badge>;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createUserMutation.mutate(formData);
    };

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <UserPlus className="mr-2 h-4 w-4" />
                                New User
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New User</DialogTitle>
                                <DialogDescription>
                                    Fill in the details to create a new user.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={formData.username}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, username: e.target.value }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, email: e.target.value }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, password: e.target.value }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({ ...prev, role: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="pentester">Pentester</SelectItem>
                                            <SelectItem value="client">Client</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={createUserMutation.isPending}>
                                        {createUserMutation.isPending ? "Creating..." : "Create User"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    <div className="text-sm text-muted-foreground mb-2">
                        {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
                    </div>
                </div>

                {isLoading ? (
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
                                <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
                            </div>
                        </div>
                        <div className="p-0">
                            <div className="border-b">
                                <div className="grid grid-cols-6 p-3">
                                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                                    <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                                    <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                                    <div className="h-4 w-20 bg-muted rounded animate-pulse ml-auto"></div>
                                </div>
                            </div>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="border-b last:border-0">
                                    <div className="grid grid-cols-6 p-3">
                                        <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
                                        <div className="h-5 w-40 bg-muted rounded animate-pulse"></div>
                                        <div className="h-5 w-20 bg-muted rounded animate-pulse"></div>
                                        <div className="h-5 w-28 bg-muted rounded animate-pulse"></div>
                                        <div className="h-5 w-16 bg-muted rounded animate-pulse"></div>
                                        <div className="flex justify-end space-x-2">
                                            <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                                            <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="border rounded-lg">
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
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell>
                                            <Badge
                                                className={user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                                            >
                                                {user.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant={user.is_active ? "outline" : "default"}
                                                    size="sm"
                                                    onClick={() => {
                                                        toggleUserStatusMutation.mutate({
                                                            userId: user.id,
                                                            isActive: user.is_active,
                                                        });
                                                    }}
                                                    className="px-2 py-1 h-8"
                                                >
                                                    {user.is_active ? "Deactivate" : "Activate"}
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
                )}
            </div>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => {
                    if (selectedUser) {
                        deleteUserMutation.mutate(selectedUser.id);
                    }
                }}
                title="Delete User"
                description={`Are you sure you want to delete ${selectedUser?.username || "this user"}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </DashboardLayout>
    );
}

export default function AdminUsersPageWrapper() {
    return (
        <AdminProtectedRoute>
            <AdminUsersPage />
        </AdminProtectedRoute>
    );
}