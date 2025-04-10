/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return process.env.NODE_ENV === 'production'
            ? [
                // In production, use the external API URL
                {
                    source: '/api/:path*',
                    destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://api:8001'}/api/:path*`,
                },
            ]
            : [
                // In development, always use the Docker service name
                {
                    source: '/api/:path*',
                    destination: 'http://api:8001/api/:path*',
                },
            ];
    },
    // We need these environment variables at build time
    env: {
        NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production'
            ? (process.env.NEXT_PUBLIC_API_URL || 'http://api:8001')
            : 'http://api:8001',
    },
};

module.exports = nextConfig; 
