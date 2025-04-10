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
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import React from "react";

export default function ProjectsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        client_id: "",
        status: "pending",
        start_date: "",
        end_date: "",
        description: "",
    });

    const { data: projects = [], isLoading } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const response = await axios.get("/api/projects");
            return response.data;
        },
    });

    const { data: clients = [] } = useQuery({
        queryKey: ["clients"],
        queryFn: async () => {
            const response = await axios.get("/api/clients");
            return response.data;
        },
    });

    const createProjectMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const response = await axios.post("/api/projects", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            setIsCreateDialogOpen(false);
            setFormData({
                name: "",
                client_id: "",
                status: "pending",
                start_date: "",
                end_date: "",
                description: "",
            });
            toast({
                title: "Project created",
                description: "The project has been successfully created.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to create project",
                variant: "destructive",
            });
        },
    });

    const deleteProjectMutation = useMutation({
        mutationFn: async (projectId: string) => {
            await axios.delete(`/api/projects/${projectId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast({
                title: "Project deleted",
                description: "The project has been successfully deleted.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to delete project",
                variant: "destructive",
            });
        },
    });

    const filteredProjects = projects.filter((project: any) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clientMap = React.useMemo(() => {
        const map = new Map();
        clients.forEach((client: any) => {
            map.set(client.id, client.username || 'Unknown Client');
        });
        return map;
    }, [clients]);

    const getClientName = (project: any) => {
        if (project.client && project.client.username) {
            return project.client.username;
        }

        if (project.client_id && clientMap.get(project.client_id)) {
            return clientMap.get(project.client_id);
        }

        return project.client_id ? `Client ${project.client_id.substring(0, 8)}...` : 'Unknown Client';
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "in_progress":
                return "bg-blue-100 text-blue-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createProjectMutation.mutate(formData);
    };

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Project</DialogTitle>
                                <DialogDescription>
                                    Fill in the details to create a new project.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Project Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="client_id">Client</Label>
                                    <Input
                                        id="client_id"
                                        value={formData.client_id}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, client_id: e.target.value }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({ ...prev, status: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, start_date: e.target.value }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                                        }
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={createProjectMutation.isPending}>
                                        {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProjects.map((project: any) => (
                                    <TableRow key={project.id}>
                                        <TableCell className="font-medium">{project.name}</TableCell>
                                        <TableCell>{getClientName(project)}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(project.status)}>
                                                {project.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{project.start_date}</TableCell>
                                        <TableCell>{project.end_date}</TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => router.push(`/projects/${project.id}`)}
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Edit</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => deleteProjectMutation.mutate(project.id)}
                                                className="text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}