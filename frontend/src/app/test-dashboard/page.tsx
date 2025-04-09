"use client";

import React from "react";
import Link from "next/link";

export default function TestDashboardPage() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Test Dashboard Page</h1>
            <p className="mb-4">This is a simple test page to check if redirection works.</p>
            <Link href="/dashboard" className="text-blue-500 hover:underline">
                Go to real dashboard
            </Link>
        </div>
    );
}
