import { NextRequest, NextResponse } from "next/server";
import type { ChatMessage, AIContext } from "@/lib/ai";
import { ragChat } from "@/lib/rag";
import { rateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import {
  generateCacheKey,
  getCache,
  setCache,
  createCachedSSEStream,
  collectSSEStream,
  CACHE_TTL,
} from "@/lib/ai-cache";

function buildChatCacheParams(messages: ChatMessage[], context?: AIContext) {
  const lastMsg = [...messages].reverse().find((m) => m.role === "user");
  const query = typeof lastMsg?.content === "string" ? lastMsg.content : "";
  return {
    query,
    msgCount: messages.length,
    page: context?.page,
    locale: context?.locale,
    listingId: context?.listing?.id,
    compCount: context?.comparisons?.length,
  };
}

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, RATE_LIMITS.ai, "ai-chat");
    if (!rl.success) return rateLimitResponse();
    const body = await request.json();
    const { messages, context } = body as {
      messages: ChatMessage[];
      context?: AIContext;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const cacheParams = buildChatCacheParams(messages, context);
    const cacheKey = generateCacheKey("chat", cacheParams);

    const cached = await getCache(cacheKey);
    if (cached) {
      const { content, sources, intent, toolsUsed } = JSON.parse(cached);
      const stream = createCachedSSEStream(content);
      const headers = new Headers({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-RAG-Intent": encodeURIComponent(intent.type),
        "X-RAG-Sources": encodeURIComponent(JSON.stringify(sources)),
        "X-RAG-Cached": "true",
      });
      if (toolsUsed?.length > 0) {
        headers.set("X-RAG-Tools", encodeURIComponent(JSON.stringify(toolsUsed)));
      }
      return new Response(stream, { headers });
    }

    const { stream, sources, intent, toolsUsed } = await ragChat(
      messages,
      context
    );

    const sourcesForHeader = sources.map((s) => ({ source: s.source, section: s.section }));

    const { passthrough, collected } = collectSSEStream(stream);

    collected.then(async (content) => {
      if (content.length > 0) {
        const cacheData = JSON.stringify({
          content,
          sources: sourcesForHeader,
          intent: { type: intent.type },
          toolsUsed,
        });
        await setCache(cacheKey, "chat", cacheData, CACHE_TTL.chat);
      }
    }).catch(() => {});

    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-RAG-Intent": encodeURIComponent(intent.type),
      "X-RAG-Sources": encodeURIComponent(JSON.stringify(sourcesForHeader)),
    });

    if (toolsUsed.length > 0) {
      headers.set("X-RAG-Tools", encodeURIComponent(JSON.stringify(toolsUsed)));
    }

    return new Response(passthrough, { headers });
  } catch (error) {
    console.error("AI chat error:", error);
    const message =
      error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { error: message },
      { status: message.includes("AI API") ? 502 : 500 }
    );
  }
}
