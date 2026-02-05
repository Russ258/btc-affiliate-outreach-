import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Explicitly set the project root to avoid multiple lockfile warning
  outputFileTracingRoot: path.join(__dirname),

  // Allow build to complete with ESLint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
