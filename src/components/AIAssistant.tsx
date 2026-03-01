"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  MessageSquare,
  X,
  Minus,
  Trash2,
  Send,
  Square,
  Bot,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Paperclip,
  Globe,
  Lightbulb,
  MoreHorizontal,
  ArrowUp,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAIAssistant } from "@/hooks/useAIContext";
import { useAIChat, type Message } from "@/hooks/useAIChat";
import { Button } from "@/components/ui/button";

export default function AIAssistant() {
  const t = useTranslations("AI");
  const { isOpen, context, quickQuestions, toggleAssistant, closeAssistant } =
    useAIAssistant();
  const { messages, isStreaming, sendMessage, stopStreaming, clearMessages } =
    useAIChat();

  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isMinimized)
      setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen, isMinimized]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    sendMessage(trimmed, context);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (q: string) => {
    if (isStreaming) return;
    sendMessage(q, context);
  };

  const handleClose = () => {
    setIsMinimized(false);
    closeAssistant();
  };

  if (!isOpen) {
    return (
      <Button
        onClick={toggleAssistant}
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        title={t("assistant")}
      >
        <MessageSquare className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="outline"
          onClick={() => setIsMinimized(false)}
          className="rounded-full gap-2 shadow-lg bg-background"
        >
          <Bot className="h-5 w-5 text-neutral-700" />
          <span className="text-sm font-medium">MotoAI</span>
          {isStreaming && (
            <span className="w-2 h-2 bg-neutral-700 rounded-full animate-pulse" />
          )}
        </Button>
      </div>
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] bg-white dark:bg-neutral-950 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <Bot className="h-4.5 w-4.5 text-neutral-600 dark:text-neutral-300" />
          </div>
          {isStreaming && (
            <span className="text-xs text-neutral-400 animate-pulse">
              {t("thinking")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <div className="w-8 h-8 rounded-full bg-neutral-800 dark:bg-neutral-200 flex items-center justify-center">
            <span className="text-xs font-semibold text-white dark:text-neutral-800">
              M
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearMessages}
            className="h-8 w-8 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full"
            title={t("clearChat")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(true)}
            className="h-8 w-8 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full"
            title={t("minimize")}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full"
            title={t("close")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
      >
        {!hasMessages ? (
          <WelcomeScreen
            quickQuestions={quickQuestions}
            onQuickQuestion={handleQuickQuestion}
            t={t}
          />
        ) : (
          <div className="px-5 py-4 space-y-5">
            {messages.map((msg, idx) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isLast={idx === messages.length - 1}
                isStreaming={isStreaming}
                onResend={() => handleQuickQuestion(msg.content)}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick questions (shown below messages when conversation exists) */}
      {quickQuestions.length > 0 && hasMessages && !isStreaming && (
        <div className="px-5 pb-2 flex flex-wrap gap-1.5 shrink-0">
          {quickQuestions.slice(0, 2).map((q, i) => (
            <button
              key={i}
              className="px-3 py-1.5 text-xs rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors truncate max-w-[190px]"
              onClick={() => handleQuickQuestion(q)}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="px-4 pb-4 pt-2 shrink-0">
        <div className="relative rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus-within:border-neutral-400 dark:focus-within:border-neutral-500 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("inputPlaceholder")}
            rows={1}
            className="w-full resize-none min-h-[44px] max-h-24 overflow-y-auto bg-transparent px-4 pt-3 pb-10 text-sm placeholder:text-neutral-400 focus:outline-none"
          />
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <button className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors">
                <Paperclip className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors">
                <Globe className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors">
                <Lightbulb className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                title={t("stop")}
              >
                <Square className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
                title={t("send")}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <p className="text-[10px] text-neutral-400 text-center mt-2">
          {t("disclaimer")}
        </p>
      </div>
    </div>
  );
}

function WelcomeScreen({
  quickQuestions,
  onQuickQuestion,
  t,
}: {
  quickQuestions: string[];
  onQuickQuestion: (q: string) => void;
  t: (key: string) => string;
}) {
  const defaultQuestions = [t("defaultQ1"), t("defaultQ2"), t("defaultQ3")];
  const questions = quickQuestions.length > 0 ? quickQuestions : defaultQuestions;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center px-6">
        <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 text-center">
          {t("welcomeTitle")}
        </h3>
      </div>
      <div className="px-5 pb-4 flex flex-wrap justify-center gap-2">
        {questions.map((q, i) => (
          <button
            key={i}
            className="px-4 py-2 text-sm rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => onQuickQuestion(q)}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatBubble({
  message,
  isLast,
  isStreaming,
  onResend,
  t,
}: {
  message: Message;
  isLast: boolean;
  isStreaming: boolean;
  onResend: () => void;
  t: (key: string) => string;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<"up" | "down" | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100">
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  const showActions = message.content && !(isLast && isStreaming);

  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-neutral-800 dark:bg-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="h-3.5 w-3.5 text-white dark:text-neutral-800" />
      </div>
      <div className="flex-1 min-w-0">
        {message.content ? (
          <div className="text-sm text-neutral-800 dark:text-neutral-100 leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-code:text-xs prose-pre:bg-neutral-100 dark:prose-pre:bg-neutral-800 prose-pre:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 py-2">
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.3s]" />
          </div>
        )}

        {showActions && (
          <div className="flex items-center gap-0.5 mt-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={t("copy")}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => setLiked(liked === "up" ? null : "up")}
              className={`p-1.5 rounded-lg transition-colors ${
                liked === "up"
                  ? "text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
              title={t("helpful")}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setLiked(liked === "down" ? null : "down")}
              className={`p-1.5 rounded-lg transition-colors ${
                liked === "down"
                  ? "text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800"
                  : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
              title={t("notHelpful")}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onResend}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={t("regenerate")}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
