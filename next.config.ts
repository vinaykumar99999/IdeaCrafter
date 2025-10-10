import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  eslint: {
    // 🚀 Skip ESLint during production builds
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
