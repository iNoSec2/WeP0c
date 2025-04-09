"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface UserSettings {
    id: string;
    email_notifications: boolean;
    dark_mode: boolean;
    language: string;
    timezone: string;
}

export default function SettingsPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<UserSettings>({
        id: "",
        email_notifications: true,
        dark_mode: false,
        language: "en",
        timezone: "UTC",
    });

    const { data: settings, isLoading } = useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            const response = await axios.get("/api/user/settings/");
            return response.data;
        },
    });

    const updateSettingsMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const response = await axios.put("/api/user/settings/", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-settings"] });
            toast({
                title: "Settings updated",
                description: "Your settings have been successfully updated.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update settings",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettingsMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="p-6">Loading...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Settings</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>
                                Configure how you want to receive notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive notifications via email
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.email_notifications}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({ ...prev, email_notifications: checked }))
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Customize the appearance of the application
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Dark Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Switch between light and dark themes
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.dark_mode}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({ ...prev, dark_mode: checked }))
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                            <CardDescription>
                                Set your language and timezone preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="language">Language</Label>
                                <Input
                                    id="language"
                                    value={formData.language}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, language: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Input
                                    id="timezone"
                                    value={formData.timezone}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, timezone: e.target.value }))
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={updateSettingsMutation.isPending}>
                            {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
} 