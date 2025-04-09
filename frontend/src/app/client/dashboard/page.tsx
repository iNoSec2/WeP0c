'use client';

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertCircle,
    Shield,
    CheckCircle2,
    Clock,
    Loader2,
    RefreshCcw,
    ExternalLink,
    Filter,
    ArrowUpDown,
    Eye
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

export default function ClientDashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [pentestSort, setPentestSort] = useState("date");
    const [vulnerabilityFilter, setVulnerabilityFilter] = useState("all");

    // Fetch client dashboard data
    const { data: dashboardData, isLoading, error, refetch: refetchDashboard } = useQuery({
        queryKey: ["client-dashboard"],
        queryFn: async () => {
            const response = await axios.get("/api/client/dashboard");
            return response.data;
        },
    });

    // Fetch active pentests
    const { data: pentests = [], refetch: refetchPentests } = useQuery({
        queryKey: ["client-pentests"],
        queryFn: async () => {
            const response = await axios.get("/api/client/pentests");
            return response.data;
        },
    });

    // Fetch vulnerabilities
    const { data: vulnerabilities = [], refetch: refetchVulnerabilities } = useQuery({
        queryKey: ["client-vulnerabilities"],
        queryFn: async () => {
            const response = await axios.get("/api/client/vulnerabilities");
            return response.data;
        },
    });

    // Function to refresh all dashboard data
    const refreshAllData = async () => {
        toast({
            title: "Refreshing dashboard",
            description: "Fetching the latest data...",
        });

        await Promise.all([
            refetchDashboard(),
            refetchPentests(),
            refetchVulnerabilities()
        ]);

        toast({
            title: "Dashboard refreshed",
            description: "All data is now up to date",
        });
    };

    // Function to navigate to vulnerability details
    const viewVulnerabilityDetails = (id) => {
        router.push(`/vulnerabilities/${id}`);
    };

    // Function to navigate to pentest details
    const viewPentestDetails = (id) => {
        router.push(`/pentests/${id}`);
    };

    // Function to sort pentests
    const sortedPentests = () => {
        return [...pentests].sort((a, b) => {
            if (pentestSort === "date") {
                return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
            } else if (pentestSort === "progress") {
                return b.progress - a.progress;
            } else if (pentestSort === "status") {
                return a.status.localeCompare(b.status);
            }
            return 0;
        });
    };

    // Function to filter vulnerabilities
    const filteredVulnerabilities = () => {
        if (vulnerabilityFilter === "all") {
            return vulnerabilities;
        }
        return vulnerabilities.filter(v => v.severity === vulnerabilityFilter);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2">Loading dashboard data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-destructive">
                <h2 className="text-lg font-semibold">Error loading dashboard</h2>
                <p>There was a problem loading your dashboard data. Please try again later or contact support.</p>
            </div>
        );
    }

    // Safely access data or use default values
    const stats = dashboardData?.stats || {
        activePentests: 0,
        criticalIssues: 0,
        fixedIssues: 0,
        fixedThisMonth: 0,
        nextPentest: null
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Client Dashboard</h1>
                <Button onClick={refreshAllData} variant="outline" className="flex items-center space-x-2">
                    <RefreshCcw className="h-4 w-4" />
                    <span>Refresh</span>
                </Button>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Pentests</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activePentests}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.pentestTypes || "No active pentests"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.criticalIssues}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.criticalIssues > 0 ? "Require immediate attention" : "No critical issues"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fixed Issues</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.fixedIssues}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.fixedThisMonth ? `+${stats.fixedThisMonth} this month` : "No issues fixed yet"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Pentest</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.nextPentest ? formatDate(new Date(stats.nextPentest.date)) : "None scheduled"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.nextPentest?.title || "No upcoming pentests"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Pentests and Vulnerabilities */}
            <Tabs defaultValue="pentests" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pentests">Active Pentests</TabsTrigger>
                    <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
                </TabsList>

                <TabsContent value="pentests" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Select onValueChange={setPentestSort}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="progress">Progress</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {sortedPentests().length === 0 ? (
                        <Card>
                            <CardContent className="py-4 text-center text-muted-foreground">
                                No active pentests found
                            </CardContent>
                        </Card>
                    ) : sortedPentests().map((pentest, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl">{pentest.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {pentest.type}
                                        </p>
                                    </div>
                                    <Badge variant={
                                        pentest.status === "in_progress" ? "default" :
                                            pentest.status === "planning" ? "secondary" :
                                                "outline"
                                    }>
                                        {pentest.status === "in_progress" ? "In Progress" :
                                            pentest.status === "planning" ? "Planning" :
                                                pentest.status === "completed" ? "Completed" : pentest.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Start Date:</span>
                                            <span className="ml-2">{formatDate(new Date(pentest.start_date))}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">End Date:</span>
                                            <span className="ml-2">{formatDate(new Date(pentest.end_date))}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Progress</span>
                                            <span>{pentest.progress || 0}%</span>
                                        </div>
                                        <div className="h-2 bg-secondary rounded-full">
                                            <div
                                                className="h-full bg-primary rounded-full"
                                                style={{ width: `${pentest.progress || 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    {pentest.findings && (
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div>
                                                <div className="text-2xl font-bold text-red-500">
                                                    {pentest.findings.critical || 0}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Critical</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-orange-500">
                                                    {pentest.findings.high || 0}
                                                </div>
                                                <div className="text-xs text-muted-foreground">High</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-yellow-500">
                                                    {pentest.findings.medium || 0}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Medium</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Button onClick={() => viewPentestDetails(pentest.id)} variant="link" className="mt-4">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Details
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="vulnerabilities" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Select onValueChange={setVulnerabilityFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {filteredVulnerabilities().length === 0 ? (
                        <Card>
                            <CardContent className="py-4 text-center text-muted-foreground">
                                No vulnerabilities found
                            </CardContent>
                        </Card>
                    ) : filteredVulnerabilities().map((vulnerability, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl">{vulnerability.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {vulnerability.project_name}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant={
                                            vulnerability.severity === "critical" ? "destructive" :
                                                vulnerability.severity === "high" ? "default" :
                                                    vulnerability.severity === "medium" ? "secondary" :
                                                        "outline"
                                        }>
                                            {vulnerability.severity.charAt(0).toUpperCase() + vulnerability.severity.slice(1)}
                                        </Badge>
                                        <Badge variant={
                                            vulnerability.status === "open" ? "destructive" :
                                                vulnerability.status === "in_progress" ? "default" :
                                                    "outline"
                                        }>
                                            {vulnerability.status === "in_progress" ? "In Progress" :
                                                vulnerability.status.charAt(0).toUpperCase() + vulnerability.status.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-sm text-muted-foreground"
                                        dangerouslySetInnerHTML={{ __html: vulnerability.description_html || vulnerability.description_md || "" }}>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Reported:</span>
                                        <span className="ml-2">{formatDate(new Date(vulnerability.created_at))}</span>
                                    </div>
                                </div>
                                <Button onClick={() => viewVulnerabilityDetails(vulnerability.id)} variant="link" className="mt-4">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Details
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}