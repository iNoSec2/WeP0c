'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Save, RefreshCw, Database, Shield, Server } from 'lucide-react';

function AdminSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'P0cit',
    siteDescription: 'Penetration Testing Management Platform',
    allowRegistration: false,
    requireEmailVerification: true,
    defaultUserRole: 'client',
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPasswords: true,
    enableTwoFactor: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newUserNotification: true,
    newProjectNotification: true,
    newVulnerabilityNotification: true,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post('/api/admin/settings', data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Settings updated',
        description: 'The settings have been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update settings',
        variant: 'destructive',
      });
    },
  });

  const handleSaveGeneralSettings = () => {
    updateSettingsMutation.mutate({
      type: 'general',
      settings: generalSettings,
    });
  };

  const handleSaveSecuritySettings = () => {
    updateSettingsMutation.mutate({
      type: 'security',
      settings: securitySettings,
    });
  };

  const handleSaveNotificationSettings = () => {
    updateSettingsMutation.mutate({
      type: 'notifications',
      settings: notificationSettings,
    });
  };

  const handleSystemBackup = async () => {
    try {
      await axios.post('/api/admin/system/backup');
      toast({
        title: 'Backup created',
        description: 'System backup has been created successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create backup',
        variant: 'destructive',
      });
    }
  };

  const handleInitializeDatabase = async () => {
    try {
      if (!confirm('This will create default users and a project. Continue?')) {
        return;
      }

      const response = await axios.post('/api/init-db');
      toast({
        title: 'Database initialized',
        description: 'Default users and project have been created.',
      });

      // Show credentials
      toast({
        title: 'Login credentials',
        description: 'Admin: admin/adminpassword, Client: client/clientpassword, Pentester: pentester/pentesterpassword',
        duration: 10000,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to initialize database',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container p-6 mx-auto">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">System Settings</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure general platform settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Input
                      id="siteDescription"
                      value={generalSettings.siteDescription}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    />
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowRegistration">Allow Public Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to register accounts without admin approval
                      </p>
                    </div>
                    <Switch
                      id="allowRegistration"
                      checked={generalSettings.allowRegistration}
                      onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, allowRegistration: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Require users to verify their email address before accessing the platform
                      </p>
                    </div>
                    <Switch
                      id="requireEmailVerification"
                      checked={generalSettings.requireEmailVerification}
                      onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveGeneralSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Configure security and authentication settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                    />
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireStrongPasswords">Require Strong Passwords</Label>
                      <p className="text-sm text-muted-foreground">
                        Require passwords to contain uppercase, lowercase, numbers, and special characters
                      </p>
                    </div>
                    <Switch
                      id="requireStrongPasswords"
                      checked={securitySettings.requireStrongPasswords}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireStrongPasswords: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to enable two-factor authentication for their accounts
                      </p>
                    </div>
                    <Switch
                      id="enableTwoFactor"
                      checked={securitySettings.enableTwoFactor}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableTwoFactor: checked }))}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSecuritySettings}>
                    <Shield className="mr-2 h-4 w-4" />
                    Save Security Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure system notification settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable email notifications for system events
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="newUserNotification">New User Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications when new users register
                      </p>
                    </div>
                    <Switch
                      id="newUserNotification"
                      checked={notificationSettings.newUserNotification}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newUserNotification: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="newProjectNotification">New Project Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications when new projects are created
                      </p>
                    </div>
                    <Switch
                      id="newProjectNotification"
                      checked={notificationSettings.newProjectNotification}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newProjectNotification: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="newVulnerabilityNotification">New Vulnerability Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications when new vulnerabilities are reported
                      </p>
                    </div>
                    <Switch
                      id="newVulnerabilityNotification"
                      checked={notificationSettings.newVulnerabilityNotification}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newVulnerabilityNotification: checked }))}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveNotificationSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notification Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Maintenance</CardTitle>
                  <CardDescription>
                    System maintenance and database operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md bg-muted p-4">
                    <div className="flex items-center gap-4">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <div>
                        <h3 className="text-sm font-medium">System Backup</h3>
                        <p className="text-sm text-muted-foreground">
                          Create a backup of the system database and configuration.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleSystemBackup}>
                        <Server className="mr-2 h-4 w-4" />
                        Create Backup
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-md bg-muted p-4 mt-4">
                    <div className="flex items-center gap-4">
                      <Database className="h-5 w-5 text-amber-500" />
                      <div>
                        <h3 className="text-sm font-medium">Initialize Database</h3>
                        <p className="text-sm text-muted-foreground">
                          Create default users (admin, client, pentester) and an example project.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleInitializeDatabase} variant="outline">
                        <Database className="mr-2 h-4 w-4" />
                        Initialize Database
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AdminSettingsPageWrapper() {
  return (
    <AdminProtectedRoute>
      <AdminSettingsPage />
    </AdminProtectedRoute>
  );
}
