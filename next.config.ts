import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable Cache Components mode
  // This changes Next.js from implicit caching (static by default)
  // to explicit caching (dynamic by default, opt-in with "use cache")
  // Note: In Next.js 16.1.1+, cacheComponents is at root level (no longer experimental)
  cacheComponents: true,
};

export default nextConfig;
