import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /** Keep react-pdf on the Node client React build — bundling into RSC crashes with `reading 'S'`. */
  serverExternalPackages: ["@react-pdf/renderer"],
  transpilePackages: [
    "remotion",
    "@remotion/player",
    "@remotion/web-renderer",
  ],
  experimental: {
    middlewareClientMaxBodySize: "20mb",
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  /** Block remote image optimization/CDN fetches — UI assets are same-origin /public only. */
  images: {
    remotePatterns: [],
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.modules = [
      path.join(process.cwd(), "node_modules"),
      ...(config.resolve.modules ?? []),
    ];

    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
    }
    if (dev && process.env.NEXT_DEV_WEBPACK_POLL === "1") {
      config.watchOptions = {
        poll: 2000,
        aggregateTimeout: 500,
        ignored: ["**/node_modules/**", "**/.git/**"],
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
