"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Calculator, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  bikeData?: {
    brand?: string;
    model?: string;
    year?: number;
    engineSize?: number;
    price?: number;
    mileage?: number;
    coeExpiryDate?: string;
    omv?: number;
    fuelConsumption?: number;
  };
}

export default function AITotalCostAnalysis({ bikeData }: Props) {
  const t = useTranslations("AI");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAnalyze() {
    setIsLoading(true);
    try {
      const prompt = `Analyze the total cost of ownership for this motorcycle in Singapore. Respond in the user's language.

Motorcycle:
- Brand: ${bikeData?.brand || "Unknown"}
- Model: ${bikeData?.model || "Unknown"}
- Year: ${bikeData?.year || "Unknown"}
- Engine: ${bikeData?.engineSize || "Unknown"}cc
- Purchase Price: S$${bikeData?.price || "Unknown"}
- Mileage: ${bikeData?.mileage || "Unknown"} km
- COE Expiry: ${bikeData?.coeExpiryDate || "Unknown"}
- OMV: ${bikeData?.omv ? `S$${bikeData.omv}` : "Unknown"}
- Fuel Consumption: ${bikeData?.fuelConsumption || "Unknown"} L/100km

Please provide a comprehensive cost breakdown including:
1. **Annual Road Tax** (based on engine displacement)
2. **Insurance Estimate** (annual, based on class and engine size)
3. **Fuel Cost** (annual estimate based on average riding)
4. **Maintenance** (annual estimate: oil changes, chain, brakes, tires)
5. **Depreciation** (monthly/annual based on COE expiry)
6. **COE Renewal Cost** (if applicable, based on current PQP)
7. **Total Annual Cost** and **Monthly Cost**
8. **5-Year Total Cost Projection**

Format as a clear table with numbers. Highlight the key total at the end.`;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          context: { page: "cost-calculator" },
        }),
      });

      if (!res.ok) throw new Error("Failed");

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
          if (!trimmed?.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              setAnalysis(fullContent);
            }
          } catch {
            // skip
          }
        }
      }
    } catch {
      setAnalysis(t("costError"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {t("totalCostTitle")}
        </CardTitle>
        <CardDescription>{t("totalCostDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("analyzing")}
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                {t("analyzeCost")}
              </>
            )}
          </Button>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs">{t("generating")}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
