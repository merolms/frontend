import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tiptap"],
  experimental: {
    serverComponentsExternalPackages: ["@tiptap"],
  },
};

export default nextConfig;
