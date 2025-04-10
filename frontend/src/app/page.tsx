"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in (has token)
        const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;
        if (token) {
            router.push("/dashboard");
        } else {
            router.push("/auth/login");
        }
    }, [router]);

    // Show loading state while redirecting
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="text-center space-y-6">
                <div className="relative mx-auto">
                    <div className="h-20 w-20 rounded-full border-4 border-muted animate-pulse-ring"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                        </svg>
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-bold mb-2">P0cit</h1>
                    <p className="text-lg text-muted-foreground mb-4">Loading your secure environment...</p>
                    <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-primary animate-progress"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}