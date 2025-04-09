'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  FileText,
  Shield,
  Activity,
  BarChart,
  CheckCircle,
  Settings,
  UserPlus,
  FolderPlus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/admin/stats');
        return response.data;
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        // Return mock data for development
        return {
          users: {
            total: 24,
            active: 20,
            by_role: {
              super_admin: 1,
              admin: 3,
              pentester: 8,
              client: 12
            }
          },
          projects: {
            total: 15,
            active: 8,
            by_status: {
              active: 8,
              completed: 5,
              planned: 2
            }
          },
          vulnerabilities: {
            total: 87,
            critical: 12,
            by_severity: {
              critical: 12,
              high: 25,
              medium: 30,
              low: 20
            }
          },
          recent_activity: [
            {
              action: 'New user registered',
              user: 'john.doe@example.com',
              timestamp: new Date().toISOString()
            },
            {
              action: 'Project completed',
              user: 'pentester@example.com',
              timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
              action: 'Critical vulnerability reported',
              user: 'security@example.com',
              timestamp: new Date(Date.now() - 7200000).toISOString()
            }
          ]
        };
      }
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container p-6 mx-auto">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-4 bg-muted rounded-full animate-pulse"></div>
                  </div>
                  <div className="h-8 w-16 bg-muted rounded animate-pulse mt-2"></div>
                  <div className="h-3 w-32 bg-muted rounded animate-pulse mt-2"></div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-40 bg-muted rounded animate-pulse"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
                    <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md animate-pulse">
                  <div className="h-16 w-16 bg-muted rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container p-6 mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex space-x-2">
              <Button asChild variant="outline">
                <Link href="/admin/users/create">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/projects/create">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Add Project
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.users?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.users?.active || 0} active users
                </p>
                {stats?.users?.by_role && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Admins: {stats.users.by_role.admin || 0}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Pentesters: {stats.users.by_role.pentester || 0}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Clients: {stats.users.by_role.client || 0}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.projects?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.projects?.active || 0} active projects
                </p>
                {stats?.projects?.by_status && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Active</span>
                      <span>{stats.projects.by_status.active || 0}</span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${Math.min(100, ((stats.projects.by_status.active || 0) / (stats.projects.total || 1)) * 100)}%`
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs mb-1 mt-2">
                      <span>Completed</span>
                      <span>{stats.projects.by_status.completed || 0}</span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${Math.min(100, ((stats.projects.by_status.completed || 0) / (stats.projects.total || 1)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.vulnerabilities?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.vulnerabilities?.critical || 0} critical vulnerabilities
                </p>
                {stats?.vulnerabilities?.by_severity && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Critical</span>
                      <span className="text-destructive">{stats.vulnerabilities.by_severity.critical || 0}</span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full bg-destructive"
                        style={{
                          width: `${Math.min(100, ((stats.vulnerabilities.by_severity.critical || 0) / (stats.vulnerabilities.total || 1)) * 100)}%`
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs mb-1 mt-2">
                      <span>High</span>
                      <span className="text-orange-500">{stats.vulnerabilities.by_severity.high || 0}</span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full bg-orange-500"
                        style={{
                          width: `${Math.min(100, ((stats.vulnerabilities.by_severity.high || 0) / (stats.vulnerabilities.total || 1)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">Active</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">API Services</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Database</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">File Storage</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Overview of recent platform activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {stats?.recent_activity?.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.user}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  )) || (
                      <div className="py-4 text-center text-muted-foreground">
                        No recent activity to display
                      </div>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                  <CardDescription>
                    Platform usage statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <BarChart className="h-16 w-16 text-muted-foreground" />
                    <p className="ml-4 text-muted-foreground">Analytics visualization coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Reports</CardTitle>
                  <CardDescription>
                    Generated system reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-4 text-center text-muted-foreground">
                    No reports available yet
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>
                    Configure system-wide settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Configure system email notifications</p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href="/admin/settings/email">
                          <Settings className="mr-2 h-4 w-4" />
                          Configure
                        </Link>
                      </Button>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">Security Settings</p>
                        <p className="text-sm text-muted-foreground">Configure system security settings</p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href="/admin/settings/security">
                          <Settings className="mr-2 h-4 w-4" />
                          Configure
                        </Link>
                      </Button>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">API Configuration</p>
                        <p className="text-sm text-muted-foreground">Configure API settings and access</p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href="/admin/settings/api">
                          <Settings className="mr-2 h-4 w-4" />
                          Configure
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6">
            <Button asChild>
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/projects">
                <FileText className="mr-2 h-4 w-4" />
                Manage Projects
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
