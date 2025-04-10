"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import hljs from 'highlight.js';

export default function CreateVulnerabilityPage({ searchParams = {} }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",  // Changed from description_md to match backend model
        severity: "medium",
        poc_type: "python",
        poc_code: "",
        poc_zip_path: "N/A",
        status: "open",
        project_id: ""
    });

    // Log the form data structure for debugging
    console.log('Initial form data structure:', formData);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [markdownTab, setMarkdownTab] = useState("edit");
    const [codeTab, setCodeTab] = useState("edit");
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [projectsError, setProjectsError] = useState("");

    // Handle project_id from URL parameters
    useEffect(() => {
        // If project_id is provided in the URL, set it in the form
        if (searchParams.project_id) {
            const projectId = searchParams.project_id as string;
            console.log('Setting project ID from URL:', projectId);

            // Special handling for specific project ID
            if (projectId === '44ef495d-0117-40d4-8c12-0851ee26887a') {
                console.log('Using special handling for project ID: 44ef495d-0117-40d4-8c12-0851ee26887a');
                // Set default values if needed
                setFormData(prev => ({
                    ...prev,
                    project_id: projectId,
                    poc_zip_path: prev.poc_zip_path || 'N/A'
                }));
            } else {
                setFormData(prev => ({ ...prev, project_id: projectId }));
            }
        }
    }, [searchParams]);

    // Initialize syntax highlighting when component mounts or code changes or tab changes
    useEffect(() => {
        if (formData.poc_code && codeTab === "preview") {
            setTimeout(() => {
                hljs.highlightAll();
            }, 50);
        }
    }, [formData.poc_code, codeTab]);

    // Update markdownTab state when description changes
    useEffect(() => {
        console.log('Description updated:', formData.description);
    }, [formData.description]);

    // Fetch projects for the dropdown with better error handling
    const { data: projects = [], isLoading: isLoadingProjects, error: projectsQueryError } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            setLoadingProjects(true);
            setProjectsError("");
            try {
                // Get token from localStorage if available
                const token = localStorage.getItem('token') || localStorage.getItem('access_token');

                // Include skip/limit parameters and auth header
                const response = await axios.get("/api/projects", {
                    params: {
                        skip: 0,
                        limit: 100
                    },
                    headers: token ? {
                        'Authorization': `Bearer ${token}`
                    } : undefined
                });

                // Log response to help debug
                console.log('Projects response:', response.data);

                if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
                    console.warn('No projects returned from API');
                    setProjectsError("No projects found. Please create a project first.");
                }

                return response.data || [];
            } catch (apiError: any) {
                console.error("Failed to fetch projects:", apiError);
                const errorMsg = apiError.response?.data?.error || "Failed to load projects";
                setProjectsError(errorMsg);
                throw apiError;
            } finally {
                setLoadingProjects(false);
            }
        },
        retry: 1, // Retry once if failed
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.project_id) {
            setError("Please fill in all required fields: title, description, and project");
            return;
        }

        setLoading(true);
        setError("");

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

        try {
            // Prepare the vulnerability data
            const vulnerabilityData = {
                ...formData,
                project_id: formData.project_id
            };

            console.log('Creating vulnerability with data:', vulnerabilityData);

            // Add custom headers for admin users
            const headers: Record<string, string> = {};

            if (isAdmin) {
                console.log('Adding admin override headers');
                headers['X-Override-Role'] = 'true';
                headers['X-Admin-Access'] = 'true';
                headers['X-Admin-Override'] = 'true';
            }

            const response = await axios.post(`/api/vulnerabilities`, vulnerabilityData, { headers });

            console.log('Vulnerability created successfully:', response.data);
            setSuccessMessage("Vulnerability created successfully!");

            // Redirect to the new vulnerability after a short delay
            setTimeout(() => {
                router.push(`/vulnerabilities/${response.data.id}`);
            }, 1500);
        } catch (error: any) {
            console.error("Failed to create vulnerability:", error);
            setError(error.response?.data?.error || "Failed to create vulnerability. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="flex items-center mb-6">
                    <Button variant="ghost" size="sm" className="mr-2" asChild>
                        <Link href="/vulnerabilities">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Vulnerabilities
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Create New Vulnerability</h1>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {successMessage && (
                    <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Vulnerability Details</CardTitle>
                            <CardDescription>
                                Fill in the details of the vulnerability you want to report
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="E.g., Cross-Site Scripting in Login Form"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="project_id">Project *</Label>
                                <Select
                                    name="project_id"
                                    value={formData.project_id}
                                    onValueChange={(value) => handleSelectChange("project_id", value)}
                                    disabled={loadingProjects || projects.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={
                                            loadingProjects
                                                ? "Loading projects..."
                                                : projectsError
                                                    ? "Error loading projects"
                                                    : projects.length === 0
                                                        ? "No projects available"
                                                        : "Select a project"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projectsError ? (
                                            <div className="py-2 px-1 text-red-500 text-sm">{projectsError}</div>
                                        ) : projects.length === 0 ? (
                                            <div className="py-2 px-1 text-muted-foreground text-sm">
                                                No projects available. Please create a project first.
                                            </div>
                                        ) : (
                                            projects.map((project: any) => (
                                                <SelectItem key={project.id} value={project.id}>
                                                    {project.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {projectsError && (
                                    <p className="text-sm text-red-500">{projectsError}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="severity">Severity</Label>
                                    <Select
                                        name="severity"
                                        value={formData.severity}
                                        onValueChange={(value) => handleSelectChange("severity", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select severity" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="critical">Critical</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="info">Info</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        onValueChange={(value) => handleSelectChange("status", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="fixed">Fixed</SelectItem>
                                            <SelectItem value="wont_fix">Won't Fix</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Markdown) *</Label>
                                <Tabs value={markdownTab} onValueChange={setMarkdownTab} className="w-full">
                                    <TabsList className="mb-2">
                                        <TabsTrigger value="edit">Edit</TabsTrigger>
                                        <TabsTrigger value="preview">Preview</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="edit">
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder="Describe the vulnerability in detail, using markdown for formatting..."
                                            rows={10}
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </TabsContent>
                                    <TabsContent value="preview">
                                        {formData.description ? (
                                            <div className="prose prose-sm max-w-none dark:prose-invert border rounded-md p-4 min-h-[250px] overflow-y-auto bg-background">
                                                <ReactMarkdown
                                                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        // @ts-ignore - ReactMarkdown types can be problematic with custom components
                                                        code({ node, inline, className, children, ...props }) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            return !inline && match ? (
                                                                <div className="relative">
                                                                    <pre className="rounded-md p-4 my-2 overflow-auto">
                                                                        <code className={className} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    </pre>
                                                                </div>
                                                            ) : (
                                                                <code className={className} {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {formData.description}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground italic border rounded-md p-4 min-h-[250px] flex items-center justify-center">
                                                No description to preview
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                                <p className="text-sm text-muted-foreground">
                                    You can use Markdown to format your description. Add headers, lists, code blocks, etc.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="poc_type">Proof of Concept Type</Label>
                                <Select
                                    name="poc_type"
                                    value={formData.poc_type}
                                    onValueChange={(value) => handleSelectChange("poc_type", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select PoC type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="python">Python</SelectItem>
                                        <SelectItem value="javascript">JavaScript</SelectItem>
                                        <SelectItem value="bash">Bash</SelectItem>
                                        <SelectItem value="html">HTML</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="poc_code">Proof of Concept Code</Label>
                                <Tabs value={codeTab} onValueChange={setCodeTab} className="w-full">
                                    <TabsList className="mb-2">
                                        <TabsTrigger value="edit">Edit</TabsTrigger>
                                        <TabsTrigger value="preview">Preview</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="edit">
                                        <Textarea
                                            id="poc_code"
                                            name="poc_code"
                                            placeholder="Add your proof of concept code or steps to reproduce..."
                                            rows={6}
                                            value={formData.poc_code}
                                            onChange={handleInputChange}
                                            className="font-mono"
                                        />
                                    </TabsContent>
                                    <TabsContent value="preview">
                                        {formData.poc_code ? (
                                            <div className="border rounded-md p-4 min-h-[150px] overflow-auto bg-background">
                                                <pre className="m-0 p-0">
                                                    <code className={`language-${formData.poc_type}`}>
                                                        {formData.poc_code}
                                                    </code>
                                                </pre>
                                            </div>
                                        ) : (
                                            <div className="text-muted-foreground italic border rounded-md p-4 min-h-[150px] flex items-center justify-center">
                                                No code to preview
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => router.push('/vulnerabilities')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Creating..." : "Create Vulnerability"}
                                {!loading && <Save className="ml-2 h-4 w-4" />}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </DashboardLayout>
    );
}