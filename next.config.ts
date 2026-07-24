import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@react-pdf/renderer"],
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 2000,
        aggregateTimeout: 500,
        ignored: ["**/node_modules/**", "**/.git/**"],
      };
    }
    return config;
  },
};
export default nextConfig;
