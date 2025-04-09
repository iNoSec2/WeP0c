"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { MicrosoftLogin } from "@/components/auth/MicrosoftLogin";
import { Separator } from "@/components/ui/separator";
import { UserLogin } from "@/types/user";

interface LoginFormValues {
    email: string;
    password: string;
}

export default function LoginPage() {
    const { login, isLoading, user } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>();

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (user) {
            router.push("/dashboard");
        }
    }, [user, router]);

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setError(null);
            await login(data);
            // Redirect will happen in the Auth context
        } catch (err) {
            console.error("Login error:", err);
            setError("Invalid email or password");
        }
    };

    const handleMicrosoftSuccess = () => {
        // Redirect will happen via the auth hook after token is set
        router.push("/dashboard");
    };

    const handleMicrosoftError = (error: Error) => {
        setError(`Microsoft login failed: ${error.message}`);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <ShieldAlert className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-center">P0cit</CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <MicrosoftLogin
                        onSuccess={handleMicrosoftSuccess}
                        onError={handleMicrosoftError}
                    />

                    <div className="flex items-center space-x-2">
                        <Separator className="flex-grow" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="flex-grow" />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                {...register("email", { required: "Email is required" })}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                {...register("password", { required: "Password is required" })}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center text-muted-foreground">
                        Don't have an account?{" "}
                        <Link href="/auth/register" className="text-primary hover:underline">
                            Register
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
} 