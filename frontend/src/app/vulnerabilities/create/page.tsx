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

export default function CreateVulnerabilityPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description_md: "",
        severity: "medium",
        poc_type: "text",
        poc_code: "",
        status: "open",
        project_id: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch projects for the dropdown
    const { data: projects = [] } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            try {
                const response = await axios.get("/api/projects");
                return response.data;
            } catch (error) {
                console.error("Failed to fetch projects:", error);
                return [];
            }
        }
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

        if (!formData.title || !formData.description_md || !formData.project_id) {
            setError("Please fill in all required fields: title, description, and project");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.post(`/api/vulnerabilities`, {
                ...formData,
                project_id: formData.project_id
            });

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
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a project" />
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
                                <Label htmlFor="description_md">Description (Markdown) *</Label>
                                <Textarea
                                    id="description_md"
                                    name="description_md"
                                    placeholder="Describe the vulnerability in detail, using markdown for formatting..."
                                    rows={10}
                                    value={formData.description_md}
                                    onChange={handleInputChange}
                                    required
                                />
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
                                <Textarea
                                    id="poc_code"
                                    name="poc_code"
                                    placeholder="Add your proof of concept code or steps to reproduce..."
                                    rows={6}
                                    value={formData.poc_code}
                                    onChange={handleInputChange}
                                />
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