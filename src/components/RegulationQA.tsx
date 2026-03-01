"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Send, BookOpen, Loader2, FileText, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Source {
  source: string;
  section: string;
}

interface QAMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  intent?: string;
}

const CATEGORIES = [
  { id: "registration", icon: "🏷️", labelKey: "catRegistration" },
  { id: "taxes", icon: "💰", labelKey: "catTaxes" },
  { id: "licensing", icon: "📋", labelKey: "catLicensing" },
  { id: "insurance", icon: "🛡️", labelKey: "catInsurance" },
  { id: "traffic", icon: "🚦", labelKey: "catTraffic" },
  { id: "emissions", icon: "🌿", labelKey: "catEmissions" },
  { id: "import-export", icon: "📦", labelKey: "catImportExport" },
  { id: "motorcycle", icon: "🏍️", labelKey: "catMotorcycle" },
];

export default function RegulationQA() {
  const t = useTranslations("Regulations");
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const quickQuestions: Record<string, string[]> = {
    registration: [
      t("q_coeCategories"),
      t("q_coeBidding"),
      t("q_coeRenewal"),
    ],
    taxes: [t("q_roadTax"), t("q_arfCalculation"), t("q_parfRebate")],
    licensing: [t("q_licenceClasses"), t("q_upgradeProcess"), t("q_testProcess")],
    insurance: [t("q_insuranceTypes"), t("q_ncdDiscount"), t("q_bikeInsurance")],
    traffic: [t("q_speedLimits"), t("q_dipsPoints"), t("q_majorOffences")],
    emissions: [t("q_vesBands"), t("q_evIncentives"), t("q_chargingInfra")],
    "import-export": [t("q_importCosts"), t("q_deregistration"), t("q_parallelImport")],
    motorcycle: [t("q_safetyGear"), t("q_pillionRules"), t("q_modification")],
  };

  async function handleSend(content: string) {
    if (!content.trim() || isLoading) return;

    const userMsg: QAMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const assistantMsg: QAMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          context: { page: "regulations", locale: undefined },
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      let sources: Source[] | undefined;
      try {
        const srcHeader = res.headers.get("X-RAG-Sources");
        if (srcHeader) sources = JSON.parse(srcHeader);
      } catch {
        // ignore
      }
      const intent = res.headers.get("X-RAG-Intent") || undefined;

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
                    ? { ...m, content: fullContent, sources, intent }
                    : m
                )
              );
            }
          } catch {
            // skip
          }
        }
      }

      if (!fullContent) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: t("noResponse"), sources, intent }
              : m
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: t("errorMessage") }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  }

  const currentQuickQuestions = activeCategory
    ? quickQuestions[activeCategory] || []
    : [];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto">
      {/* Category Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              setActiveCategory(activeCategory === cat.id ? null : cat.id)
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            <span>{cat.icon}</span>
            {t(cat.labelKey)}
          </button>
        ))}
      </div>

      {/* Quick Questions */}
      {currentQuickQuestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {currentQuickQuestions.map((q, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleSend(q)}
              disabled={isLoading}
            >
              {q}
            </Button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">{t("welcomeTitle")}</p>
            <p className="text-sm mt-2 max-w-md">{t("welcomeSubtitle")}</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content || "..."}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1.5">
                    <FileText className="h-3 w-3" />
                    {t("sources")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-xs bg-background/50 rounded px-2 py-0.5"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {src.section}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading &&
          messages[messages.length - 1]?.role === "assistant" &&
          !messages[messages.length - 1]?.content && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <Card className="shrink-0">
        <CardContent className="p-3">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("inputPlaceholder")}
              rows={1}
              className="flex-1 resize-none border-0 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground min-h-[40px] max-h-[120px] py-2 px-1"
            />
            <Button
              size="icon"
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
