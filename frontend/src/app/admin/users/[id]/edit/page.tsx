"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;
    const { toast } = useToast();
    const queryClient = useQueryClient();
    
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "",
        is_active: true
    });
    
    const [error, setError] = useState("");
    const [isPasswordChanged, setIsPasswordChanged] = useState(false);

    // Fetch user data
    const { data: user, isLoading } = useQuery<User>({
        queryKey: ["user", userId],
        queryFn: async () => {
            try {
                const response = await axios.get(`/api/admin/users/${userId}`);
                return response.data;
            } catch (error: any) {
                console.error("Error fetching user:", error);
                setError(error.response?.data?.error || "Failed to load user data");
                throw error;
            }
        },
        enabled: !!userId
    });

    // Update form data when user data is loaded
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                password: "", // Don't show password
                role: user.role.toLowerCase() || "",
                is_active: user.is_active
            });
        }
    }, [user]);

    // Update user mutation
    const updateUserMutation = useMutation({
        mutationFn: async (data: any) => {
            // Only include password if it was changed
            const updateData = { ...data };
            if (!isPasswordChanged || !updateData.password) {
                delete updateData.password;
            }
            
            const response = await axios.put(`/api/admin/users/${userId}`, updateData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", userId] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            
            toast({
                title: "User updated",
                description: "The user has been successfully updated.",
            });
            
            router.push("/admin/users");
        },
        onError: (error: any) => {
            console.error("Error updating user:", error);
            setError(error.response?.data?.error || "Failed to update user");
            
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to update user",
                variant: "destructive",
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUserMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="container mx-auto py-6">
                    <div className="flex items-center space-x-2 mb-6">
                        <Button variant="outline" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </div>
                    <div className="text-center py-10">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-auto"></div>
                        </div>
                        <p className="mt-4 text-gray-500">Loading user details...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6">
                <div className="flex items-center space-x-2 mb-6">
                    <Button variant="outline" onClick={() => router.push("/admin/users")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Users
                    </Button>
                    <h1 className="text-2xl font-bold">Edit User</h1>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>User Details</CardTitle>
                            <CardDescription>
                                Update the user information below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Password {!isPasswordChanged && "(leave blank to keep current password)"}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => {
                                        setFormData((prev) => ({ ...prev, password: e.target.value }));
                                        if (e.target.value) {
                                            setIsPasswordChanged(true);
                                        } else {
                                            setIsPasswordChanged(false);
                                        }
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="pentester">Pentester</SelectItem>
                                        <SelectItem value="client">Client</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.is_active ? "active" : "inactive"}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, is_active: value === "active" }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" onClick={() => router.push("/admin/users")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateUserMutation.isPending}>
                                {updateUserMutation.isPending ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                                        Updating...
                                    </div>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Update User
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </DashboardLayout>
    );
}

export default function EditUserPageWrapper() {
    return (
        <AdminProtectedRoute>
            <EditUserPage />
        </AdminProtectedRoute>
    );
}
