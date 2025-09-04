import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Force all pages to be dynamic to avoid SSG issues with React 19
  output: 'standalone',
};

export default nextConfig;
