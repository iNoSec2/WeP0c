"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { projectsService } from "@/lib/api/projects";
import { CalendarDays, ClipboardList, Clock, FileText, Shield, UserPlus, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.id as string;
    const [activeTab, setActiveTab] = useState("overview");

    const { data: project, isLoading, error } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => projectsService.getProject(projectId),
        enabled: !!projectId,
    });

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <Skeleton className="h-12 w-3/4 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </div>
                    <Skeleton className="h-96" />
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
                        <h3 className="text-lg font-semibold">Error loading project</h3>
                        <p>Could not load the project details. Please try again later.</p>
                        <Button variant="outline" className="mt-4" asChild>
                            <Link href="/projects">Back to Projects</Link>
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!project) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="bg-muted p-4 rounded-md text-center">
                        <h3 className="text-lg font-semibold">Project Not Found</h3>
                        <p>The requested project could not be found.</p>
                        <Button variant="outline" className="mt-4" asChild>
                            <Link href="/projects">Back to Projects</Link>
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "planning":
                return "bg-blue-100 text-blue-800";
            case "in_progress":
                return "bg-yellow-100 text-yellow-800";
            case "completed":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">{project.name}</h1>
                        <div className="flex items-center mt-1 text-muted-foreground">
                            <CalendarDays className="h-4 w-4 mr-1" />
                            <span>
                                Created on {formatDate(project.created_at)}
                            </span>
                        </div>
                    </div>
                    <Badge
                        className={`mt-2 sm:mt-0 ${getStatusColor(project.status)}`}
                    >
                        {project.status.replace("_", " ").toUpperCase()}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Client</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{project.client_id}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>
                                    {project.start_date ? formatDate(project.start_date) : "Not set"}
                                    {" - "}
                                    {project.end_date ? formatDate(project.end_date) : "Not set"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Pentesters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center">
                                <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{project.pentester_ids?.length || 0} assigned</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-line">
                                    {project.description || "No description provided."}
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="vulnerabilities" className="mt-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Vulnerabilities</CardTitle>
                                <Button size="sm" asChild>
                                    <Link href={`/vulnerabilities?project=${project.id}`}>
                                        View All
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p>This tab will display vulnerabilities associated with this project.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Reports</CardTitle>
                                <Button size="sm">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generate Report
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p>This tab will display reports for this project.</p>

                                {/* Sample report PDF download button */}
                                <div className="mt-4 p-4 border rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <FileText className="h-5 w-5 mr-2 text-primary" />
                                            <div>
                                                <h4 className="font-medium">Security Assessment Report</h4>
                                                <p className="text-sm text-muted-foreground">Generated on {formatDate(new Date().toISOString())}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href="/sample-report.pdf" target="_blank" download>Download PDF</a>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
} 