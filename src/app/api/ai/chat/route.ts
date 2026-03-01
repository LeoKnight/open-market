import { NextRequest, NextResponse } from "next/server";
import type { ChatMessage, AIContext } from "@/lib/ai";
import { ragChat } from "@/lib/rag";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context } = body as {
      messages: ChatMessage[];
      context?: AIContext;
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const { stream, sources, intent, toolsUsed } = await ragChat(
      messages,
      context
    );

    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-RAG-Intent": encodeURIComponent(intent.type),
      "X-RAG-Sources": encodeURIComponent(
        JSON.stringify(
          sources.map((s) => ({ source: s.source, section: s.section }))
        )
      ),
    });

    if (toolsUsed.length > 0) {
      headers.set("X-RAG-Tools", encodeURIComponent(JSON.stringify(toolsUsed)));
    }

    return new Response(stream, { headers });
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
