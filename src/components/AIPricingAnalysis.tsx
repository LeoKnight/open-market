"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  DollarSign,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PricingFactor {
  factor: string;
  impact: "positive" | "negative" | "neutral";
  detail: string;
}

interface PricingAnalysis {
  suggestedPriceRange: { low: number; mid: number; high: number };
  marketPosition: "below_market" | "fair" | "above_market";
  competitivenessScore: number;
  factors: PricingFactor[];
  summary: string;
  recommendation: string;
}

interface Props {
  listing: {
    brand: string;
    model: string;
    year: number;
    engineSize: number;
    mileage: number;
    price: number;
    condition?: string;
    coeExpiryDate?: string;
    omv?: number;
  };
}

export default function AIPricingAnalysis({ listing }: Props) {
  const t = useTranslations("AI");
  const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listing),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch {
      setError(t("pricingError"));
    } finally {
      setIsLoading(false);
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPositionBadge = (position: string) => {
    switch (position) {
      case "below_market":
        return <Badge variant="default" className="bg-green-500">{t("belowMarket")}</Badge>;
      case "above_market":
        return <Badge variant="destructive">{t("aboveMarket")}</Badge>;
      default:
        return <Badge variant="secondary">{t("fairPrice")}</Badge>;
    }
  };

  if (!analysis) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("pricingTitle")}
          </CardTitle>
          <CardDescription>{t("pricingDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-destructive mb-3">{error}</p>
          )}
          <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("analyzing")}
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                {t("analyzePricing")}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {t("pricingTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Range */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t("suggestedRange")}</span>
            {getPositionBadge(analysis.marketPosition)}
          </div>
          <div className="flex items-baseline gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              S${analysis.suggestedPriceRange.low.toLocaleString()}
            </span>
            <span className="text-xl font-bold text-primary">
              S${analysis.suggestedPriceRange.mid.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              S${analysis.suggestedPriceRange.high.toLocaleString()}
            </span>
          </div>
          {listing.price && (
            <p className="text-xs text-muted-foreground mt-1">
              {t("currentPrice")}: S${listing.price.toLocaleString()}
            </p>
          )}
        </div>

        {/* Competitiveness Score */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>{t("competitiveness")}</span>
            <span className="font-medium">{analysis.competitivenessScore}/10</span>
          </div>
          <Progress value={analysis.competitivenessScore * 10} />
        </div>

        {/* Factors */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t("pricingFactors")}</h4>
          {analysis.factors.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              {getImpactIcon(f.impact)}
              <div>
                <span className="font-medium">{f.factor}: </span>
                <span className="text-muted-foreground">{f.detail}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border-t pt-3">
          <p className="text-sm">{analysis.summary}</p>
          <p className="text-sm font-medium text-primary mt-2">
            {analysis.recommendation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
