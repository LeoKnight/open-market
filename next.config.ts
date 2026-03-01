import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
      {
        protocol: "http",
        hostname: "leoknight.ddns.net",
        port: "8080",
      },
      {
        protocol: "http",
        hostname: "leoknight.ddns.net",
        port: "9000",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
