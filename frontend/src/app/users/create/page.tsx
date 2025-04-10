"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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

export default function CreateUserPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: Role.CLIENT,
        full_name: "",
        company: "",
    });

    const createUserMutation = useMutation({
        mutationFn: async (userData: typeof formData) => {
            const response = await axios.post(
                `/api/users`,
                userData,
                { withCredentials: true }
            );
            return response.data;
        },
        onSuccess: () => {
            toast({
                title: "User created",
                description: "The user has been successfully created.",
            });
            router.push("/users");
        },
        onError: (error: any) => {
            console.error("Error creating user:", error);

            // Provide more detailed error messages when available
            const errorMessage = error.response?.data?.error || "Failed to create user. Please try again.";

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createUserMutation.mutate(formData);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <DashboardLayout>
            <div className="container p-6 mx-auto">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Create New User</h1>
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
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
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
                                    <SelectItem value={Role.SUPER_ADMIN}>Super Admin</SelectItem>
                                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                                    <SelectItem value={Role.PENTESTER}>Pentester</SelectItem>
                                    <SelectItem value={Role.CLIENT}>Client</SelectItem>
                                    <SelectItem value={Role.USER}>User</SelectItem>
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
                            <Button type="submit" disabled={createUserMutation.isPending}>
                                {createUserMutation.isPending ? "Creating..." : "Create User"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
} 