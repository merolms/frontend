import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tiptap"],
  turbopack: {
    resolveAlias: {
      "@": "./",
      "@/components/*": "./components/*",
      "@/containers/*": "./containers/*",
      "@/context/*": "./context/*",
      "@/contexts/*": "./contexts/*",
      "@/services/*": "./services/*",
      "@/redux/*": "./redux/*",
      "@/hooks/*": "./hooks/*",
      "@/lib/*": "./lib/*",
      "@/utils/*": "./utils/*",
      "@/types/*": "./types/*",
      "@/styles/*": "./styles/*",
      "@/editor/*": "./editor/*",
      "@/ui/*": "./ui/*",
      "@/api/*": "./api/*",
    },
  },
};

export default nextConfig;
