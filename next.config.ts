import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Explicitly set the project root to avoid multiple lockfile warning
  outputFileTracingRoot: path.join(__dirname),

  // Allow build to complete with ESLint warnings
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },

  typescript: {
    // Allow build with type errors (not recommended for production)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
