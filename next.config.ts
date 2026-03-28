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
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com",  pathname: "/**" },
      { protocol: "https", hostname: "plus.unsplash.com",    pathname: "/**" },
      { protocol: "https", hostname: "images.pexels.com",    pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos",        pathname: "/**" },
      { protocol: "https", hostname: "i.pinimg.com",         pathname: "/**" },
      {
        protocol: "https",
        hostname: "storage.railway.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "shelved-vase-x3gg-pw2l8t2.s3.auto.amazonaws.com",
        pathname: "/**",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;