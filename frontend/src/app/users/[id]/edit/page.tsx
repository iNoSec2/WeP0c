"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
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
import { Role } from "@/types/user";

export default function EditUserPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        role: Role.CLIENT,
    });

    const { data: user, isLoading } = useQuery({
        queryKey: ["user", params.id],
        queryFn: async () => {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`,
                { withCredentials: true }
            );
            return response.data;
        },
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                role: user.role,
            });
        }
    }, [user]);

    const updateUserMutation = useMutation({
        mutationFn: async (userData: typeof formData) => {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`,
                userData,
                { withCredentials: true }
            );
            return response.data;
        },
        onSuccess: () => {
            toast({
                title: "User updated",
                description: "The user has been successfully updated.",
            });
            router.push("/users");
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to update user. Please try again.",
                variant: "destructive",
            });
            console.error("Error updating user:", error);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUserMutation.mutate(formData);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="container p-6 mx-auto">
                    <div className="max-w-2xl mx-auto">
                        <p>Loading...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container p-6 mx-auto">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Edit User</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({ ...prev, role: value as Role }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                                    <SelectItem value={Role.PENTESTER}>Pentester</SelectItem>
                                    <SelectItem value={Role.CLIENT}>Client</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/users")}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateUserMutation.isPending}>
                                {updateUserMutation.isPending ? "Updating..." : "Update User"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
} 