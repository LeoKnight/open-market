"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Bot } from "lucide-react";
import { useAIAssistant } from "@/hooks/useAIContext";
import { Button } from "@/components/ui/button";

interface AIListingConsultProps {
  listing: Record<string, unknown>;
}

export default function AIListingConsult({ listing }: AIListingConsultProps) {
  const t = useTranslations("AI");
  const { openAssistant, setListingContext } = useAIAssistant();

  useEffect(() => { setListingContext(listing); }, [listing, setListingContext]);

  const quickQuestions = [t("listingQ1"), t("listingQ2"), t("listingQ3"), t("listingQ4"), t("listingQ5")];

  const handleClick = () => { openAssistant({ listing }, quickQuestions); };

  return (
    <Button
      onClick={handleClick}
      className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md hover:shadow-lg"
      size="lg"
    >
      <Bot className="h-5 w-5" />
      {t("askAboutBike")}
    </Button>
  );
}
