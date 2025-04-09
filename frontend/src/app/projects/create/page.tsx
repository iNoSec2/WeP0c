"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { ProjectStatus } from "@/types/project";

export default function CreateProject() {
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [clientId, setClientId] = useState("");
    const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.PLANNING);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch clients
    const { data: clients = [], isLoading: clientsLoading } = useQuery({
        queryKey: ["clients"],
        queryFn: async () => {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/clients`);
            return response.data;
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !clientId) {
            toast({
                title: "Validation Error",
                description: "Please fill all required fields",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Ensure we're sending the correct data format
            const projectData = {
                name: name.trim(),
                client_id: clientId,
                status: status
            };

            console.log('Sending project data:', projectData);

            const response = await axios.post(
                '/api/projects/projects/',
                projectData,
                {
                    withCredentials: true,
                }
            );

            toast({
                title: "Success",
                description: "Project created successfully",
            });

            router.push(`/projects/${response.data.id}`);
        } catch (error: any) {
            console.error("Error creating project:", error);
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to create project",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold mb-6">Create New Project</h1>

                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                        <CardDescription>
                            Enter the details for your new project
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter project name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="client">Client</Label>
                                <Select
                                    value={clientId}
                                    onValueChange={setClientId}
                                    disabled={clientsLoading}
                                >
                                    <SelectTrigger id="client">
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client: any) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.username} ({client.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Project Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={(value) => setStatus(value as ProjectStatus)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ProjectStatus.PLANNING}>Planning</SelectItem>
                                        <SelectItem value={ProjectStatus.IN_PROGRESS}>In Progress</SelectItem>
                                        <SelectItem value={ProjectStatus.COMPLETED}>Completed</SelectItem>
                                        <SelectItem value={ProjectStatus.CANCELLED}>Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Project"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}