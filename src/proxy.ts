import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

const RATE_LIMIT_ROUTES: Record<string, { config: typeof RATE_LIMITS[keyof typeof RATE_LIMITS]; prefix: string }> = {
  "/api/ai/": { config: RATE_LIMITS.ai, prefix: "ai" },
  "/api/auth/signup": { config: RATE_LIMITS.signup, prefix: "signup" },
  "/api/knowledge-base/reindex": { config: RATE_LIMITS.reindex, prefix: "reindex" },
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    for (const [route, { config, prefix }] of Object.entries(RATE_LIMIT_ROUTES)) {
      if (pathname.startsWith(route)) {
        const result = rateLimit(request, config, prefix);
        if (!result.success) return rateLimitResponse();
        break;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
