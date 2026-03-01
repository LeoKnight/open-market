import { createHash } from "crypto";
import { prisma } from "./prisma";

interface MemoryCacheEntry {
  response: string;
  expiresAt: number;
}

const MAX_MEMORY_ENTRIES = 500;
const memoryCache = new Map<string, MemoryCacheEntry>();

export const CACHE_TTL = {
  listingScore: 24 * 60 * 60,
  pricing: 6 * 60 * 60,
  vision: 7 * 24 * 60 * 60,
  chat: 1 * 60 * 60,
} as const;

export type CacheEndpoint = "listing-score" | "pricing" | "vision" | "chat";

export function generateCacheKey(
  endpoint: string,
  params: Record<string, unknown>
): string {
  const normalized = JSON.stringify(params, Object.keys(params).sort());
  const payload = `${endpoint}:${normalized}`;
  return createHash("sha256").update(payload).digest("hex");
}

function evictMemoryIfNeeded(): void {
  if (memoryCache.size < MAX_MEMORY_ENTRIES) return;

  const now = Date.now();
  for (const [key, entry] of memoryCache) {
    if (entry.expiresAt <= now) {
      memoryCache.delete(key);
    }
  }

  if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
    const oldest = memoryCache.keys().next().value;
    if (oldest) memoryCache.delete(oldest);
  }
}

export async function getCache(key: string): Promise<string | null> {
  const now = Date.now();

  const memEntry = memoryCache.get(key);
  if (memEntry) {
    if (memEntry.expiresAt > now) {
      return memEntry.response;
    }
    memoryCache.delete(key);
  }

  try {
    const dbEntry = await prisma.aiCache.findUnique({ where: { key } });
    if (dbEntry && dbEntry.expiresAt.getTime() > now) {
      memoryCache.set(key, {
        response: dbEntry.response,
        expiresAt: dbEntry.expiresAt.getTime(),
      });
      return dbEntry.response;
    }
    if (dbEntry) {
      prisma.aiCache.delete({ where: { key } }).catch(() => {});
    }
  } catch (err) {
    console.warn("[AI Cache] DB read failed:", (err as Error).message);
  }

  return null;
}

export async function setCache(
  key: string,
  endpoint: CacheEndpoint,
  response: string,
  ttlSeconds: number
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  evictMemoryIfNeeded();
  memoryCache.set(key, {
    response,
    expiresAt: expiresAt.getTime(),
  });

  try {
    await prisma.aiCache.upsert({
      where: { key },
      update: { response, endpoint, expiresAt },
      create: { key, endpoint, response, expiresAt },
    });
  } catch (err) {
    console.warn("[AI Cache] DB write failed:", (err as Error).message);
  }
}

export async function clearExpiredCache(): Promise<number> {
  try {
    const now = Date.now();
    for (const [key, entry] of memoryCache) {
      if (entry.expiresAt <= now) {
        memoryCache.delete(key);
      }
    }

    const result = await prisma.aiCache.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    console.log(`[AI Cache] Cleared ${result.count} expired DB entries`);
    return result.count;
  } catch (err) {
    console.warn("[AI Cache] Cleanup failed:", (err as Error).message);
    return 0;
  }
}

export function createCachedSSEStream(content: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      const chunk = {
        id: `chatcmpl-cached-${Date.now()}`,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: "cached",
        choices: [
          {
            index: 0,
            delta: { role: "assistant", content },
            finish_reason: null,
          },
        ],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));

      const doneChunk = {
        ...chunk,
        choices: [
          { index: 0, delta: {}, finish_reason: "stop" },
        ],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(doneChunk)}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

export function collectSSEStream(
  stream: ReadableStream<Uint8Array>
): { passthrough: ReadableStream<Uint8Array>; collected: Promise<string> } {
  const decoder = new TextDecoder();
  let fullContent = "";
  let resolveCollected: (value: string) => void;
  const collected = new Promise<string>((resolve) => {
    resolveCollected = resolve;
  });

  const reader = stream.getReader();
  const passthrough = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        resolveCollected(fullContent);
        controller.close();
        return;
      }
      controller.enqueue(value);

      const text = decoder.decode(value, { stream: true });
      const lines = text.split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
        try {
          const json = JSON.parse(line.slice(6));
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) fullContent += delta;
        } catch {
          // partial JSON or non-JSON line
        }
      }
    },
  });

  return { passthrough, collected };
}

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

export function startPeriodicCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    clearExpiredCache().catch(() => {});
  }, CLEANUP_INTERVAL_MS);
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

startPeriodicCleanup();
