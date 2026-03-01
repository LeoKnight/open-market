import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetTime) store.delete(key);
  }
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  ai: { maxRequests: 10, windowMs: 60_000 } as RateLimitConfig,
  signup: { maxRequests: 5, windowMs: 3_600_000 } as RateLimitConfig,
  general: { maxRequests: 30, windowMs: 60_000 } as RateLimitConfig,
  reindex: { maxRequests: 2, windowMs: 3_600_000 } as RateLimitConfig,
} as const;

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  prefix = "default"
): { success: boolean; remaining: number } {
  cleanup();
  const ip = getClientIp(request);
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const entry = store.get(key);
  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return { success: true, remaining: config.maxRequests - 1 };
  }

  if (entry.count >= config.maxRequests) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: config.maxRequests - entry.count };
}

export function rateLimitResponse() {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": "60" },
    }
  );
}
