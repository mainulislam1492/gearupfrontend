import type { NextConfig } from "next";

const BACKEND = process.env.BACKEND_URL ?? "https://gear-up-peach.vercel.app";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND}/api/:path*` }];
  },
};

export default nextConfig;