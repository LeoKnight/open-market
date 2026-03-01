"use client";

import { useState, useCallback, useRef } from "react";
import type { AIContext } from "@/lib/ai";

export interface RAGMetadata {
  intent?: string;
  sources?: Array<{ source: string; section: string }>;
  toolsUsed?: string[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  ragMetadata?: RAGMetadata;
}

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, context?: AIContext) => {
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsStreaming(true);

      abortRef.current = new AbortController();

      try {
        const apiMessages = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, context }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          throw new Error("AI request failed");
        }

        const ragIntent = res.headers.get("X-RAG-Intent") || undefined;
        let ragSources: RAGMetadata["sources"];
        let ragTools: string[] | undefined;
        try {
          const srcHeader = res.headers.get("X-RAG-Sources");
          if (srcHeader) ragSources = JSON.parse(srcHeader);
          const toolHeader = res.headers.get("X-RAG-Tools");
          if (toolHeader) ragTools = JSON.parse(toolHeader);
        } catch {
          // ignore parse errors
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              }
            } catch {
              // skip malformed chunks
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? {
                  ...m,
                  content: fullContent || "Sorry, I could not generate a response.",
                  ragMetadata: {
                    intent: ragIntent,
                    sources: ragSources,
                    toolsUsed: ragTools,
                  },
                }
              : m
          )
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? {
                    ...m,
                    content:
                      "An error occurred. Please try again.",
                  }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    sendMessage,
    stopStreaming,
    clearMessages,
    setMessages,
  };
}
