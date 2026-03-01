"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ScoreDimension {
  score: number;
  feedback: string;
}

interface ListingScore {
  overallScore: number;
  dimensions: {
    titleQuality: ScoreDimension;
    descriptionQuality: ScoreDimension;
    photoCount: ScoreDimension;
    priceReasonability: ScoreDimension;
    infoCompleteness: ScoreDimension;
  };
  missingFields: string[];
  improvements: string[];
  strengths: string[];
}

interface Props {
  listingData: Record<string, unknown>;
}

export default function AIListingScore({ listingData }: Props) {
  const t = useTranslations("AI");
  const [score, setScore] = useState<ListingScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleScore() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/listing-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingData),
      });
      if (!res.ok) throw new Error("Score failed");
      const data = await res.json();
      setScore(data.score);
      setExpanded(true);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-500";
    if (s >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (s: number) => {
    if (s >= 80) return "[&>div]:bg-green-500";
    if (s >= 60) return "[&>div]:bg-yellow-500";
    return "[&>div]:bg-red-500";
  };

  if (!score) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleScore}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        {t("checkScore")}
      </Button>
    );
  }

  const dims = [
    { key: "titleQuality", label: t("scoreTitle") },
    { key: "descriptionQuality", label: t("scoreDescription") },
    { key: "photoCount", label: t("scorePhotos") },
    { key: "priceReasonability", label: t("scorePrice") },
    { key: "infoCompleteness", label: t("scoreCompleteness") },
  ] as const;

  return (
    <Card>
      <CardHeader
        className="pb-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {t("listingScore")}
          </span>
          <span className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(score.overallScore)}`}>
              {score.overallScore}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        </CardTitle>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3 pt-0">
          {/* Dimensions */}
          {dims.map(({ key, label }) => {
            const dim = score.dimensions[key];
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{label}</span>
                  <span className={getScoreColor(dim.score)}>{dim.score}</span>
                </div>
                <Progress
                  value={dim.score}
                  className={`h-1.5 ${getProgressColor(dim.score)}`}
                />
                <p className="text-xs text-muted-foreground mt-0.5">
                  {dim.feedback}
                </p>
              </div>
            );
          })}

          {/* Missing Fields */}
          {score.missingFields.length > 0 && (
            <div>
              <p className="text-xs font-medium flex items-center gap-1 mb-1">
                <AlertCircle className="h-3 w-3 text-yellow-500" />
                {t("missingFields")}
              </p>
              <div className="flex flex-wrap gap-1">
                {score.missingFields.map((f, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {score.improvements.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">{t("improvements")}</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {score.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-yellow-500 mt-0.5">-</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths */}
          {score.strengths.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">{t("strengths")}</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {score.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
