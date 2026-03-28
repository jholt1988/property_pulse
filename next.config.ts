import type { NextConfig } from "next";

const backendOrigin =
  process.env.BACKEND_API_ORIGIN ??
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:3001" : undefined);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (!backendOrigin) return [];

    return [
      {
        // Proxy backend API through Next.js to keep browser calls same-origin
        // and avoid CORS / localhost resolution issues.
        source: "/api/backend/:path*",
        destination: `${backendOrigin.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
