/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://p0cit-app:8001/api/:path*',
            },
        ];
    },
};

module.exports = nextConfig; 