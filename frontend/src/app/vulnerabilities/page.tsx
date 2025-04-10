"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { PlusCircle, Search, Edit, Trash2, Play } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import MarkdownEditor, { MarkdownDisplay } from "@/components/MarkdownEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Vulnerability {
    id: string;
    title: string;
    severity: string;
    status: string;
    project_id: string;
    project_name: string;
    description: string;
    description_html?: string;
    poc_type?: string;
    poc_code?: string;
    poc_html?: string;
    created_at: string;
    updated_at: string;
    discovered_by?: string;
    fixed_by?: string;
    fixed_at?: string;
}

interface Project {
    id: string;
    name: string;
}

export default function VulnerabilitiesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        severity: "low",
        status: "open",
        project_id: "",
        description: "",
        poc_type: "python",
        poc_code: "",
        poc_zip_path: "N/A",
    });

    const [activeTab, setActiveTab] = useState("description");
    const [selectedVuln, setSelectedVuln] = useState<any | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { data: vulnerabilities = [], isLoading } = useQuery<Vulnerability[]>({
        queryKey: ["vulnerabilities"],
        queryFn: async () => {
            try {
                // Try to get all vulnerabilities first
                const response = await axios.get("/api/vulnerabilities/all");
                console.log('Fetched all vulnerabilities:', response.data.length);
                return response.data;
            } catch (error) {
                console.error('Error fetching all vulnerabilities, falling back to recent:', error);
                // Fall back to recent vulnerabilities if all fails
                const fallbackResponse = await axios.get("/api/vulnerabilities/recent");
                return fallbackResponse.data;
            }
        },
    });

    const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
        queryKey: ["projects"],
        queryFn: async () => {
            const response = await axios.get("/api/projects");
            return response.data;
        },
    });

    const createVulnerabilityMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            console.log('Submitting vulnerability data to API:', data);

            // Check if user is admin or super admin
            const token = localStorage.getItem('token') || localStorage.getItem('access_token');
            let isAdmin = false;

            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    isAdmin = payload.role === 'SUPER_ADMIN' || payload.role === 'ADMIN';
                    console.log(`User role: ${payload.role}, isAdmin: ${isAdmin}`);
                } catch (e) {
                    console.error('Error parsing token:', e);
                }
            }

            // Add custom headers for admin users
            const headers: Record<string, string> = {};

            if (isAdmin) {
                console.log('Adding admin override headers');
                headers['X-Override-Role'] = 'true';
                headers['X-Admin-Access'] = 'true';
                headers['X-Admin-Override'] = 'true';
            }

            const response = await axios.post("/api/vulnerabilities", data, { headers });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vulnerabilities"] });
            setIsCreateDialogOpen(false);
            setFormData({
                title: "",
                severity: "low",
                status: "open",
                project_id: "",
                description: "",
                poc_type: "python",
                poc_code: "",
                poc_zip_path: "N/A",
            });
            toast({
                title: "Vulnerability created",
                description: "The vulnerability has been successfully created.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create vulnerability",
                variant: "destructive",
            });
        },
    });

    const deleteVulnerabilityMutation = useMutation({
        mutationFn: async (vulnerabilityId: string) => {
            await axios.delete(`/api/vulnerabilities/${vulnerabilityId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vulnerabilities"] });
            toast({
                title: "Vulnerability deleted",
                description: "The vulnerability has been successfully deleted.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete vulnerability",
                variant: "destructive",
            });
        },
    });

    const filteredVulnerabilities = vulnerabilities.filter((vulnerability) =>
        vulnerability.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "critical":
                return "bg-red-100 text-red-800";
            case "high":
                return "bg-orange-100 text-orange-800";
            case "medium":
                return "bg-yellow-100 text-yellow-800";
            case "low":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "open":
                return "bg-red-100 text-red-800";
            case "in_progress":
                return "bg-blue-100 text-blue-800";
            case "fixed":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.project_id || !formData.description) {
            toast({
                title: "Validation Error",
                description: "Please fill all required fields: title, description, and project",
                variant: "destructive",
            });
            return;
        }

        console.log('Submitting vulnerability data:', formData);
        createVulnerabilityMutation.mutate(formData);
    };

    const handleRunPoc = async (vulnerabilityId: string) => {
        try {
            const response = await axios.post(`/api/vulnerabilities/execute/${vulnerabilityId}`);
            toast({
                title: "PoC Executed",
                description: `Result: ${response.data.success ? 'Success' : 'Failed'} - ${response.data.output.substring(0, 100)}${response.data.output.length > 100 ? '...' : ''}`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to execute PoC",
                variant: "destructive",
            });
        }
    };

    const handleDeleteVuln = (vuln: any) => {
        setSelectedVuln(vuln);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteVuln = () => {
        if (selectedVuln) {
            deleteVulnerabilityMutation.mutate(selectedVuln.id);
        }
    };

    return (
        <DashboardLayout>
            <div className="container p-6 mx-auto">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Vulnerabilities</h1>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    New Vulnerability
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Vulnerability</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details to create a new vulnerability.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="title">Title</label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, title: e.target.value }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="severity">Severity</label>
                                            <Select
                                                value={formData.severity}
                                                onValueChange={(value) =>
                                                    setFormData((prev) => ({ ...prev, severity: value }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select severity" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="critical">Critical</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="low">Low</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="status">Status</label>
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
                                                    <SelectItem value="open">Open</SelectItem>
                                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                                    <SelectItem value="fixed">Fixed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="project_id">Project</label>
                                        <Select
                                            value={formData.project_id}
                                            onValueChange={(value) =>
                                                setFormData((prev) => ({ ...prev, project_id: value }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {projects.map((project: any) => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        {project.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="description">Description</TabsTrigger>
                                            <TabsTrigger value="poc">Proof of Concept</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="description" className="space-y-2 mt-2">
                                            <label htmlFor="description">Description (Markdown)</label>
                                            <MarkdownEditor
                                                value={formData.description}
                                                onChange={(value) =>
                                                    setFormData((prev) => ({ ...prev, description: value }))
                                                }
                                                height="300px"
                                            />
                                        </TabsContent>
                                        <TabsContent value="poc" className="space-y-4 mt-2">
                                            <div className="space-y-2">
                                                <label htmlFor="poc_type">PoC Type</label>
                                                <Select
                                                    value={formData.poc_type}
                                                    onValueChange={(value) =>
                                                        setFormData((prev) => ({ ...prev, poc_type: value }))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select PoC type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="python">Python</SelectItem>
                                                        <SelectItem value="bash">Bash</SelectItem>
                                                        <SelectItem value="go">Go</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="poc_code">PoC Code</label>
                                                <textarea
                                                    id="poc_code"
                                                    value={formData.poc_code}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({ ...prev, poc_code: e.target.value }))
                                                    }
                                                    className="w-full h-64 p-2 border rounded-md font-mono text-sm"
                                                    placeholder={`Enter your ${formData.poc_type} code here...`}
                                                />
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <DialogFooter>
                                        <Button type="submit" disabled={createVulnerabilityMutation.isPending}>
                                            {createVulnerabilityMutation.isPending ? "Creating..." : "Create Vulnerability"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Filter Vulnerabilities</CardTitle>
                            <CardDescription>
                                Use the filters below to find specific vulnerabilities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by title..."
                                            className="pl-8"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-pulse">Loading vulnerabilities...</div>
                        </div>
                    ) : filteredVulnerabilities.length > 0 ? (
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Project</TableHead>
                                            <TableHead>Severity</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredVulnerabilities.map((vulnerability) => (
                                            <TableRow key={vulnerability.id}>
                                                <TableCell className="font-medium">{vulnerability.title}</TableCell>
                                                <TableCell>{vulnerability.project_name}</TableCell>
                                                <TableCell>
                                                    <Badge className={getSeverityColor(vulnerability.severity)}>
                                                        {vulnerability.severity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(vulnerability.status)}>
                                                        {vulnerability.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(vulnerability.created_at)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        {vulnerability.poc_code && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRunPoc(vulnerability.id)}
                                                                title="Run PoC"
                                                            >
                                                                <Play className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => router.push(`/vulnerabilities/${vulnerability.id}/edit`)}
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteVuln(vulnerability)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10">
                            <p className="text-lg text-center mb-4">No vulnerabilities found matching your filters</p>
                            <Button asChild>
                                <Link href="/vulnerabilities/create">Add New Vulnerability</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDeleteVuln}
                title="Delete Vulnerability"
                description={`Are you sure you want to delete ${selectedVuln?.title || "this vulnerability"}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </DashboardLayout>
    );
}