/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Use a conditional rewrite based on environment
    async rewrites() {
        return process.env.NODE_ENV === 'production'
            ? [
                // In production, use the external API URL
                {
                    source: '/api/:path*',
                    destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://p0cit-app:8001'}/api/:path*`,
                },
            ]
            : [
                // In development, use the Docker service name inside the frontend container
                // but not for the Next.js API routes which we want to handle ourselves
                {
                    source: '/direct-api/:path*',
                    destination: 'http://api:8001/api/:path*',
                },
            ];
    },
    // We need these environment variables at build time
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
    },
};

module.exports = nextConfig; 