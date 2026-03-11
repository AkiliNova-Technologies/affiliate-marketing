import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "https://affiliate-marketing-system-backend-production.up.railway.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;