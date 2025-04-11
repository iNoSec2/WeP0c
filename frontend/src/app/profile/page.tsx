"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { User, Settings, Shield, Key } from "lucide-react";
import { profileService, ProfileUpdateData, PasswordUpdateData } from "@/lib/api/profile";

interface ProfileFormValues {
  fullName: string;
  email: string;
  company?: string;
  bio?: string;
  avatarUrl?: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
    watch: watchProfile,
  } = useForm<ProfileFormValues>();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm<PasswordFormValues>();

  // Get user data from API or localStorage on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Try to get profile data from API first
        const profileData = await profileService.getProfile();
        console.log('Profile data from API:', profileData);

        setUserData(profileData);

        // Pre-fill the form with user data from API
        resetProfile({
          fullName: profileData.full_name || profileData.username || "",
          email: profileData.email || "",
          company: profileData.company || "",
          bio: profileData.bio || "",
          avatarUrl: profileData.avatar_url || "",
        });
      } catch (error) {
        console.error("Error fetching profile from API:", error);

        // Fallback to localStorage if API fails
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUserData(parsedUser);

            // Pre-fill the form with user data from localStorage
            resetProfile({
              fullName: parsedUser.full_name || parsedUser.username || "",
              email: parsedUser.email || "",
              company: parsedUser.company || "",
              bio: parsedUser.bio || "",
              avatarUrl: parsedUser.avatar_url || "",
            });
          } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
          }
        }
      }
    };

    fetchProfileData();
  }, [resetProfile]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      // Prepare data for API call
      const profileData: ProfileUpdateData = {
        fullName: data.fullName,
        email: data.email,
        company: data.company,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
      };

      console.log("Profile data to update:", profileData);

      // Call the profile service to update the profile
      const response = await profileService.updateProfile(profileData);

      // Update local storage with new data
      if (userData) {
        const updatedUser = {
          ...userData,
          full_name: data.fullName,
          email: data.email,
          company: data.company,
          bio: data.bio,
          avatar_url: data.avatarUrl,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserData(updatedUser);
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    try {
      // Prepare data for API call
      const passwordData: PasswordUpdateData = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };

      console.log("Password data to update:", passwordData);

      // Call the profile service to change the password
      await profileService.changePassword(passwordData);

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });

      resetPassword();
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          {...registerProfile("fullName", { required: "Full name is required" })}
                        />
                        {profileErrors.fullName && (
                          <p className="text-sm text-red-500">{profileErrors.fullName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          {...registerProfile("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address"
                            }
                          })}
                        />
                        {profileErrors.email && (
                          <p className="text-sm text-red-500">{profileErrors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Company (Optional)</Label>
                        <Input
                          id="company"
                          {...registerProfile("company")}
                        />
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="avatarUrl">Profile Picture URL (Optional)</Label>
                        <Input
                          id="avatarUrl"
                          {...registerProfile("avatarUrl")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio (Optional)</Label>
                        <Textarea
                          id="bio"
                          rows={5}
                          placeholder="Tell us about yourself"
                          {...registerProfile("bio")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={watchProfile?.("avatarUrl") || userData?.avatar_url} />
                        <AvatarFallback>
                          {userData?.full_name ? getInitials(userData.full_name) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{userData?.full_name || userData?.username}</p>
                        <p className="text-sm text-muted-foreground">{userData?.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">Role: {userData?.role}</p>
                      </div>
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Update your password and security preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        {...registerPassword("currentPassword", {
                          required: "Current password is required"
                        })}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        {...registerPassword("newPassword", {
                          required: "New password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters"
                          }
                        })}
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...registerPassword("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) => {
                            return value === watch("newPassword") || "Passwords do not match";
                          }
                        })}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>

                <Separator className="my-8" />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Account Security
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Additional security settings for your account.
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account.
                      </p>
                    </div>
                    <Button variant="outline" disabled>Coming Soon</Button>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="font-medium">Session Management</h4>
                      <p className="text-sm text-muted-foreground">
                        Manage your active sessions and devices.
                      </p>
                    </div>
                    <Button variant="outline" disabled>Coming Soon</Button>
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
