"use client";

import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClientUser {
    id: string;
    username: string;
    email: string;
}

interface PentesterUser {
    id: string;
    username: string;
    email: string;
}

export default function CreateProject() {
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [clientId, setClientId] = useState("");
    const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.PLANNING);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientError, setClientError] = useState<string | null>(null);
    const [pentesterId, setPentesterId] = useState<string>("");

    // Fetch clients with robust error handling
    const {
        data: clients = [],
        isLoading: clientsLoading,
        error: clientsError,
        refetch: refetchClients
    } = useQuery<ClientUser[]>({
        queryKey: ["clients"],
        queryFn: async () => {
            const response = await axios.get("/api/users/clients");
            return response.data;
        },
        retry: 2,
        refetchOnWindowFocus: false,
        refetchInterval: 60000 // Retry every minute
    });

    // Add this query alongside the existing clients query
    const {
        data: pentesters = [],
        isLoading: penterstersLoading,
        error: penterstersError
    } = useQuery<PentesterUser[]>({
        queryKey: ["pentesters"],
        queryFn: async () => {
            const response = await axios.get("/api/users/pentesters");
            return response.data;
        },
        retry: 2,
        refetchOnWindowFocus: false
    });

    // Reset client error when clientId changes
    useEffect(() => {
        if (clientId) setClientError(null);
    }, [clientId]);

    // Validate client selection before submission
    const validateClientSelection = () => {
        if (!clientId) {
            setClientError("Please select a client");
            return false;
        }

        // Verify the selected client exists in our list
        const selectedClient = clients.find(client => client.id === clientId);
        if (!selectedClient) {
            setClientError("Invalid client selection");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name) {
            toast({
                title: "Validation Error",
                description: "Project name is required",
                variant: "destructive",
            });
            return;
        }

        // Validate client selection
        if (!validateClientSelection()) {
            return;
        }

        // Validate pentester selection
        if (!pentesterId) {
            toast({
                title: "Validation Error",
                description: "Lead Pentester is required",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const projectData = {
                name: name.trim(),
                client_id: clientId,
                pentester_id: pentesterId,
                status: status,
                start_date: startDate,
                end_date: endDate,
                description: description.trim()
            };

            console.log('Creating project:', projectData);

            const response = await axios.post(
                '/api/projects',
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

            // Handle specific error cases
            if (error.response?.status === 400 && error.response?.data?.error?.includes('client_id')) {
                setClientError("Invalid client selection. Please select a valid client.");
            } else {
                toast({
                    title: "Error",
                    description: error.response?.data?.detail || "Failed to create project",
                    variant: "destructive",
                });
            }
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
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="client" className={clientError ? "text-destructive" : ""}>
                                        Client <span className="text-destructive">*</span>
                                    </Label>
                                    {clientsLoading && (
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                            Loading clients...
                                        </div>
                                    )}
                                    {clientsError && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => refetchClients()}
                                            className="h-6 text-xs"
                                        >
                                            Retry
                                        </Button>
                                    )}
                                </div>

                                <Select
                                    value={clientId}
                                    onValueChange={setClientId}
                                    disabled={clientsLoading || clients.length === 0}
                                >
                                    <SelectTrigger
                                        id="client"
                                        className={clientError ? "border-destructive ring-destructive" : ""}
                                    >
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.username} {client.email && `(${client.email})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {clientError && (
                                    <p className="text-sm text-destructive mt-1">{clientError}</p>
                                )}

                                {!clientsLoading && !clientsError && clients.length === 0 && (
                                    <Alert variant="default" className="mt-2 border-amber-200 bg-amber-50 text-amber-700">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            No clients available. Please create a client first.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {clientsError && (
                                    <Alert variant="destructive" className="mt-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Failed to load clients. Please try again.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pentester">Lead Pentester *</Label>
                                <Select
                                    value={pentesterId}
                                    onValueChange={setPentesterId}
                                    disabled={penterstersLoading || pentesters.length === 0}
                                >
                                    <SelectTrigger id="pentester">
                                        <SelectValue placeholder="Select a pentester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pentesters.map((pentester) => (
                                            <SelectItem key={pentester.id} value={pentester.id}>
                                                {pentester.username} {pentester.email && `(${pentester.email})`}
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter project description"
                                    rows={4}
                                />
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
                            <Button
                                type="submit"
                                disabled={isSubmitting || clientsLoading || clients.length === 0}
                                className="min-w-[120px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : "Create Project"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}
