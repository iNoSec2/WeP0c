import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../providers";
import { Toaster } from "../components/ui/toaster";
import { RouteGuard } from '@/components/auth/RouteGuard'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "P0cit - Penetration Testing Management Platform",
    description: "Manage penetration testing projects, vulnerabilities, and reports",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <RouteGuard>
                        {children}
                    </RouteGuard>
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
} 