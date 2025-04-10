"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import hljs from 'highlight.js';

export default function EditVulnerabilityPage() {
    const router = useRouter();
    const params = useParams();
    const vulnerabilityId = params.id as string;
    const queryClient = useQueryClient();
    
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        severity: "medium",
        poc_type: "python",
        poc_code: "",
        poc_zip_path: "N/A",
        status: "open",
        project_id: ""
    });
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [markdownTab, setMarkdownTab] = useState("edit");
    const [codeTab, setCodeTab] = useState("edit");
    
    // Fetch vulnerability data
    const { data: vulnerability, isLoading: isLoadingVulnerability } = useQuery({
        queryKey: ['vulnerability', vulnerabilityId],
        queryFn: async () => {
            try {
                const response = await axios.get(`/api/vulnerabilities/${vulnerabilityId}`);
                console.log('Fetched vulnerability data:', response.data);
                return response.data;
            } catch (error: any) {
                console.error('Error fetching vulnerability:', error.response?.data || error.message);
                setError('Failed to load vulnerability data');
                throw error;
            }
        },
        enabled: !!vulnerabilityId
    });
    
    // Fetch projects for the dropdown
    const { data: projects = [] } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const response = await axios.get("/api/projects");
            return response.data;
        },
    });
    
    // Update form data when vulnerability data is loaded
    useEffect(() => {
        if (vulnerability) {
            setFormData({
                title: vulnerability.title || "",
                description: vulnerability.description || "",
                severity: vulnerability.severity || "medium",
                poc_type: vulnerability.poc_type || "python",
                poc_code: vulnerability.poc_code || "",
                poc_zip_path: vulnerability.poc_zip_path || "N/A",
                status: vulnerability.status || "open",
                project_id: vulnerability.project_id || ""
            });
        }
    }, [vulnerability]);
    
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
    
    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    
    // Handle select changes
    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    
    // Update mutation
    const updateVulnerabilityMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            setLoading(true);
            try {
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
                
                console.log('Updating vulnerability with data:', data);
                const response = await axios.put(`/api/vulnerabilities/${vulnerabilityId}`, data, { headers });
                return response.data;
            } catch (error: any) {
                console.error('Error updating vulnerability:', error.response?.data || error.message);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        onSuccess: () => {
            // Invalidate queries to refetch data
            queryClient.invalidateQueries({ queryKey: ['vulnerability', vulnerabilityId] });
            queryClient.invalidateQueries({ queryKey: ['vulnerabilities'] });
            
            // Show success message and redirect
            console.log('Vulnerability updated successfully');
            router.push(`/vulnerabilities/${vulnerabilityId}`);
        },
        onError: (error: any) => {
            setError(error.response?.data?.detail || 'Failed to update vulnerability');
        }
    });
    
    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description || !formData.project_id) {
            setError("Please fill in all required fields: title, description, and project");
            return;
        }
        
        updateVulnerabilityMutation.mutate(formData);
    };
    
    if (isLoadingVulnerability) {
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
                        <p className="mt-4 text-gray-500">Loading vulnerability details...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }
    
    return (
        <DashboardLayout>
            <div className="container mx-auto py-6">
                <div className="flex items-center space-x-2 mb-6">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Vulnerability</h1>
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
                            <CardTitle>Vulnerability Details</CardTitle>
                            <CardDescription>
                                Update the vulnerability information below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="Vulnerability title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
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
                                            <div className="p-4 border rounded-md min-h-[200px] prose prose-sm max-w-none dark:prose-invert">
                                                <ReactMarkdown
                                                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                                    remarkPlugins={[remarkGfm]}
                                                >
                                                    {formData.description}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <div className="p-4 border rounded-md min-h-[200px] text-gray-400 italic">
                                                Preview will appear here...
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="severity">Severity</Label>
                                    <Select
                                        value={formData.severity}
                                        onValueChange={(value) => handleSelectChange("severity", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select severity" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
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
                                <Label htmlFor="project_id">Project *</Label>
                                <Select
                                    value={formData.project_id}
                                    onValueChange={(value) => handleSelectChange("project_id", value)}
                                    disabled={true} // Disable changing project
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
                                <p className="text-sm text-gray-500">
                                    Project cannot be changed after creation.
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="poc_type">Proof of Concept Type</Label>
                                <Select
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
                                        <SelectItem value="powershell">PowerShell</SelectItem>
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
                                            placeholder="Enter your proof of concept code here..."
                                            rows={10}
                                            value={formData.poc_code}
                                            onChange={handleInputChange}
                                            className="font-mono"
                                        />
                                    </TabsContent>
                                    <TabsContent value="preview">
                                        {formData.poc_code ? (
                                            <div className="p-4 border rounded-md min-h-[200px] overflow-auto">
                                                <pre>
                                                    <code className={`language-${formData.poc_type}`}>
                                                        {formData.poc_code}
                                                    </code>
                                                </pre>
                                            </div>
                                        ) : (
                                            <div className="p-4 border rounded-md min-h-[200px] text-gray-400 italic">
                                                Preview will appear here...
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                                        Updating...
                                    </div>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Update Vulnerability
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
