"use client";

import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { PocDisplay } from "@/components/PocDisplay";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/types/user";
import dashboardAPI from "@/lib/api/dashboard";
import vulnerabilitiesAPI from "@/lib/api/vulnerabilities";
import {
    Users,
    FolderKanban,
    Shield,
    Bug,
    AlertTriangle,
    CheckCircle,
    Plus,
    ArrowRight,
    Settings,
    UserCog,
    FileText,
    Calendar,
    Clock,
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

// Define a vulnerability interface
interface Vulnerability {
    id: string;
    title: string;
    description?: string;
    severity?: string;
    status?: string;
    project_id?: string;
    poc_code?: string;
    [key: string]: any; // Allow for other properties
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = React.useState("overview");
    const [showWelcomeBanner, setShowWelcomeBanner] = React.useState(false);

    const queryClient = useQueryClient();

    // Effect to remove any welcome banners
    useEffect(() => {
        // Function to remove welcome banners
        const removeWelcomeBanners = () => {
            const banners = document.querySelectorAll('div[role="alert"], [class*="welcome-banner"]');
            banners.forEach(banner => {
                const text = banner.textContent || '';
                if (text.includes('Welcome to P0cit') || text.includes('Initialize Database')) {
                    banner.remove();
                }
            });
        };

        // Execute on mount and after a delay
        removeWelcomeBanners();
        const timer = setTimeout(removeWelcomeBanners, 500);

        return () => clearTimeout(timer);
    }, []);

    // Fetch dashboard stats
    const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
        queryKey: ["dashboard-stats"],
        queryFn: dashboardAPI.getStats,
        staleTime: 60000, // 1 minute
    });

    // Fetch recent vulnerabilities with proper error handling
    const { data: vulnerabilitiesData, isLoading: vulnerabilitiesLoading } = useQuery<Vulnerability[]>({
        queryKey: ["recent-vulnerabilities"],
        queryFn: vulnerabilitiesAPI.getRecent,
        staleTime: 60000, // 1 minute
    });

    // Ensure we always have an array even if data is undefined
    const recentVulnerabilities = Array.isArray(vulnerabilitiesData) ? vulnerabilitiesData : [];

    // Mutation for executing POCs
    const executePocMutation = useMutation({
        mutationFn: (id: string) => vulnerabilitiesAPI.execute(id),
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['recent-vulnerabilities'] });
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
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Dashboard</h1>

                    {/* Role-based action buttons */}
                    <div className="flex gap-2">
                        <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER]}>
                            <Button asChild>
                                <Link href="/vulnerabilities/create">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Vulnerability
                                </Link>
                            </Button>
                        </RoleGuard>

                        <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN]}>
                            <Button asChild variant="outline">
                                <Link href="/projects/create">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Project
                                </Link>
                            </Button>
                        </RoleGuard>
                    </div>
                </div>

                {/* Stats Cards - Different cards shown based on role */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN]}>
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
                    </RoleGuard>

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

                    <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER, Role.CLIENT]}>
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
                    </RoleGuard>

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

                {/* Role-specific Quick Links */}
                <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER]}>
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Quick Links</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN]}>
                                    <Link href="/admin/users" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <UserCog className="h-8 w-8 mb-2 text-primary" />
                                        <span>User Management</span>
                                    </Link>
                                </RoleGuard>

                                <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER]}>
                                    <Link href="/pentests/reports" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <FileText className="h-8 w-8 mb-2 text-primary" />
                                        <span>Reports</span>
                                    </Link>
                                </RoleGuard>

                                <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER]}>
                                    <Link href="/pentests/calendar" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <Calendar className="h-8 w-8 mb-2 text-primary" />
                                        <span>Schedule</span>
                                    </Link>
                                </RoleGuard>

                                <RoleGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER]}>
                                    <Link href="/pentests/timesheets" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <Clock className="h-8 w-8 mb-2 text-primary" />
                                        <span>Timesheets</span>
                                    </Link>
                                </RoleGuard>
                            </div>
                        </CardContent>
                    </Card>
                </RoleGuard>

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
                                    {recentVulnerabilities.length > 0 ? (
                                        recentVulnerabilities.slice(0, 3).map((vulnerability: any) => (
                                            <PocDisplay
                                                key={vulnerability.id}
                                                vulnerability={vulnerability}
                                                onExecute={(result) => {
                                                    console.log('POC execution result:', result);
                                                    // You can add additional logic here if needed
                                                }}
                                                isExecuting={executePocMutation.isPending && executePocMutation.variables === vulnerability.id}
                                                executeHandler={() => executePocMutation.mutate(vulnerability.id)}
                                            />
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-6 text-center">
                                            <Bug className="h-10 w-10 text-muted-foreground mb-2" />
                                            <h3 className="text-lg font-medium">No vulnerabilities yet</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Vulnerabilities found during pentests will appear here
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pocs" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {recentVulnerabilities.filter((v: any) => v.poc_code).length > 0 ? (
                                recentVulnerabilities.filter((v: any) => v.poc_code).map((vulnerability: any) => (
                                    <PocDisplay
                                        key={vulnerability.id}
                                        vulnerability={vulnerability}
                                        onExecute={(result) => {
                                            console.log('POC execution result:', result);
                                            // You can add additional logic here if needed
                                        }}
                                        isExecuting={executePocMutation.isPending && executePocMutation.variables === vulnerability.id}
                                        executeHandler={() => executePocMutation.mutate(vulnerability.id)}
                                    />
                                ))
                            ) : (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                        <Shield className="h-10 w-10 text-muted-foreground mb-2" />
                                        <h3 className="text-lg font-medium">No PoCs available</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Proof of Concept code for vulnerabilities will appear here
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
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