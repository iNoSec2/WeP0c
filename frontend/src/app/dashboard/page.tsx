"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { PocDisplay } from "@/components/PocDisplay";
import WelcomeMessage from "@/components/WelcomeMessage";
import {
    Users,
    FolderKanban,
    Shield,
    Bug,
    AlertTriangle,
    CheckCircle,
    Plus,
    ArrowRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
    totalUsers: number;
    totalProjects: number;
    totalPentests: number;
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    recentActivities: {
        id: string;
        type: string;
        description: string;
        timestamp: string;
        status: string;
    }[];
}

export default function DashboardPage() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("overview");

    const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const response = await axios.get("/api/dashboard/stats/");
            return response.data;
        },
    });

    const { data: recentVulnerabilities = [], isLoading: vulnerabilitiesLoading } = useQuery({
        queryKey: ["recent-vulnerabilities"],
        queryFn: async () => {
            const response = await axios.get("/api/vulnerabilities/recent");
            return response.data;
        },
    });

    if (statsLoading || vulnerabilitiesLoading) {
        return (
            <DashboardLayout>
                <div className="p-6 space-y-6">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-4 bg-muted rounded w-1/2"></div>
                                    <div className="h-8 bg-muted rounded w-3/4 mt-2"></div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <WelcomeMessage />

                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href="/vulnerabilities/create">
                                <Plus className="w-4 h-4 mr-2" />
                                New Vulnerability
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/projects/create">
                                <Plus className="w-4 h-4 mr-2" />
                                New Project
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                            <Progress value={100} className="mt-2" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                            <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
                            <Progress value={100} className="mt-2" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pentests</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalPentests || 0}</div>
                            <Progress value={100} className="mt-2" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Critical Vulnerabilities</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.criticalVulnerabilities || 0}</div>
                            <Progress value={100} className="mt-2" />
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="pocs">Available PoCs</TabsTrigger>
                        <TabsTrigger value="activities">Recent Activities</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Vulnerabilities</CardTitle>
                                <CardDescription>Latest vulnerabilities added to the system</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentVulnerabilities.slice(0, 3).map((vulnerability: any) => (
                                        <PocDisplay key={vulnerability.id} vulnerability={vulnerability} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pocs" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {recentVulnerabilities.filter((v: any) => v.poc_code).map((vulnerability: any) => (
                                <PocDisplay key={vulnerability.id} vulnerability={vulnerability} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="activities" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activities</CardTitle>
                                <CardDescription>Latest actions in the system</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats?.recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    {activity.type === 'vulnerability' && <Bug className="h-4 w-4" />}
                                                    {activity.type === 'pentest' && <Shield className="h-4 w-4" />}
                                                    {activity.type === 'project' && <FolderKanban className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{activity.description}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatDate(activity.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={activity.status === 'completed' ? 'default' : 'outline'}>
                                                {activity.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}