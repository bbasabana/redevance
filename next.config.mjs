import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    transpilePackages: ["@react-pdf/renderer"],
    // CORS pour API mobile (app Flutter) — pas de cookies, auth par Bearer
    async headers() {
        return [
            {
                source: "/api/mobile/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
                    { key: "Access-Control-Allow-Headers", value: "Authorization, Content-Type, Accept" },
                    { key: "Access-Control-Max-Age", value: "86400" },
                ],
            },
        ];
    },
};

export default withPWA(nextConfig);

