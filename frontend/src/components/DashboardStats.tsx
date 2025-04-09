'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Users,
    FolderKanban,
    Shield,
    Bug,
    AlertTriangle,
    CheckCircle,
    XCircle,
} from 'lucide-react';

interface DashboardStatsProps {
    stats: {
        totalUsers: number;
        totalProjects: number;
        totalPentests: number;
        totalVulnerabilities: number;
        criticalVulnerabilities: number;
        highVulnerabilities: number;
        mediumVulnerabilities: number;
        lowVulnerabilities: number;
        completedPentests: number;
        activePentests: number;
    };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const vulnerabilityProgress = {
        critical: (stats.criticalVulnerabilities / stats.totalVulnerabilities) * 100 || 0,
        high: (stats.highVulnerabilities / stats.totalVulnerabilities) * 100 || 0,
        medium: (stats.mediumVulnerabilities / stats.totalVulnerabilities) * 100 || 0,
        low: (stats.lowVulnerabilities / stats.totalVulnerabilities) * 100 || 0,
    };

    const pentestProgress = {
        completed: (stats.completedPentests / stats.totalPentests) * 100 || 0,
        active: (stats.activePentests / stats.totalPentests) * 100 || 0,
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <Progress value={100} className="mt-2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProjects}</div>
                    <Progress value={100} className="mt-2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pentests</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalPentests}</div>
                    <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Completed</span>
                            <span className="font-medium">{stats.completedPentests}</span>
                        </div>
                        <Progress value={pentestProgress.completed} className="h-1" />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Active</span>
                            <span className="font-medium">{stats.activePentests}</span>
                        </div>
                        <Progress value={pentestProgress.active} className="h-1" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
                    <Bug className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalVulnerabilities}</div>
                    <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-destructive">Critical</span>
                            <span className="font-medium">{stats.criticalVulnerabilities}</span>
                        </div>
                        <Progress value={vulnerabilityProgress.critical} className="h-1" />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-orange-500">High</span>
                            <span className="font-medium">{stats.highVulnerabilities}</span>
                        </div>
                        <Progress value={vulnerabilityProgress.high} className="h-1" />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-yellow-500">Medium</span>
                            <span className="font-medium">{stats.mediumVulnerabilities}</span>
                        </div>
                        <Progress value={vulnerabilityProgress.medium} className="h-1" />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-green-500">Low</span>
                            <span className="font-medium">{stats.lowVulnerabilities}</span>
                        </div>
                        <Progress value={vulnerabilityProgress.low} className="h-1" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 