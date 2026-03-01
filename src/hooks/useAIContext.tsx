"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import type { AIContext } from "@/lib/ai";

interface AIAssistantState {
  isOpen: boolean;
  context: AIContext;
  quickQuestions: string[];
  openAssistant: (ctx?: Partial<AIContext>, questions?: string[]) => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;
  setListingContext: (listing: Record<string, unknown>) => void;
  setCompareContext: (comparisons: Record<string, unknown>[]) => void;
  setFormContext: (formData: Record<string, unknown>) => void;
  clearContext: () => void;
}

const AIAssistantContext = createContext<AIAssistantState | null>(null);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [extraContext, setExtraContext] = useState<Partial<AIContext>>({});
  const [quickQuestions, setQuickQuestions] = useState<string[]>([]);

  const getPageFromPathname = useCallback((): string => {
    if (pathname.startsWith("/listings/new") || pathname.includes("/edit"))
      return "listing-form";
    if (pathname.startsWith("/listings/")) return "listing-detail";
    if (pathname.startsWith("/compare")) return "compare";
    if (pathname.startsWith("/coe-trends")) return "coe-trends";
    if (pathname.startsWith("/depreciation")) return "depreciation";
    if (pathname.startsWith("/motorcycle-cost")) return "cost-calculator";
    if (pathname.startsWith("/power-to-weight")) return "power-to-weight";
    if (pathname.startsWith("/fuel-consumption")) return "fuel-consumption";
    return "home";
  }, [pathname]);

  const context: AIContext = {
    page: getPageFromPathname(),
    locale,
    ...extraContext,
  };

  const openAssistant = useCallback(
    (ctx?: Partial<AIContext>, questions?: string[]) => {
      if (ctx) setExtraContext((prev) => ({ ...prev, ...ctx }));
      if (questions) setQuickQuestions(questions);
      setIsOpen(true);
    },
    []
  );

  const closeAssistant = useCallback(() => setIsOpen(false), []);
  const toggleAssistant = useCallback(() => setIsOpen((v) => !v), []);

  const setListingContext = useCallback(
    (listing: Record<string, unknown>) => {
      setExtraContext((prev) => ({ ...prev, listing }));
    },
    []
  );

  const setCompareContext = useCallback(
    (comparisons: Record<string, unknown>[]) => {
      setExtraContext((prev) => ({ ...prev, comparisons }));
    },
    []
  );

  const setFormContext = useCallback(
    (formData: Record<string, unknown>) => {
      setExtraContext((prev) => ({ ...prev, formData }));
    },
    []
  );

  const clearContext = useCallback(() => {
    setExtraContext({});
    setQuickQuestions([]);
  }, []);

  return (
    <AIAssistantContext.Provider
      value={{
        isOpen,
        context,
        quickQuestions,
        openAssistant,
        closeAssistant,
        toggleAssistant,
        setListingContext,
        setCompareContext,
        setFormContext,
        clearContext,
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const ctx = useContext(AIAssistantContext);
  if (!ctx) throw new Error("useAIAssistant must be used within AIAssistantProvider");
  return ctx;
}
