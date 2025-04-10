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
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        document.addEventListener('DOMContentLoaded', function() {
                            // Remove any welcome banners with P0cit title
                            const removeWelcomeBanners = () => {
                                // Look for elements with titles containing 'Welcome' and 'P0cit'
                                const banners = document.querySelectorAll('div[role="alert"], [class*="welcome"], [class*="banner"]');
                                banners.forEach(banner => {
                                    const text = banner.textContent || '';
                                    if (text.includes('Welcome to P0cit') || text.includes('Initialize Database')) {
                                        banner.style.display = 'none';
                                        banner.remove();
                                    }
                                });
                            };
                            
                            // Execute immediately and also after a short delay
                            removeWelcomeBanners();
                            setTimeout(removeWelcomeBanners, 500);
                            setTimeout(removeWelcomeBanners, 1500);
                        });
                    `
                }} />
            </head>
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