"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AIRecommender() {
  const t = useTranslations("Recommend");
  const [budget, setBudget] = useState("");
  const [usage, setUsage] = useState("");
  const [licenseClass, setLicenseClass] = useState("");
  const [experience, setExperience] = useState("");
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRecommend() {
    if (!budget || !usage || !licenseClass) return;
    setIsLoading(true);
    setRecommendation(null);

    try {
      const prompt = `You are a motorcycle expert advisor in Singapore. Based on the user's preferences, recommend the top 5 motorcycles they should consider. Search our marketplace for matching listings.

USER PREFERENCES:
- Budget: S$${budget}
- Primary Use: ${usage}
- License Class: ${licenseClass}
- Experience Level: ${experience || "Not specified"}

For each recommended motorcycle, provide:
1. **Brand & Model** with year range
2. **Why it's suitable** for their use case
3. **Typical price range** in Singapore (with COE)
4. **Key specs** (engine, power, weight)
5. **Pros and Cons** for this user

Also provide:
- License class compatibility check
- Budget feasibility assessment
- Top recommendation with reasoning

Format the response clearly with headers and bullet points. Be specific to the Singapore market.`;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          context: { page: "recommend" },
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
              setRecommendation(fullContent);
            }
          } catch {
            // skip
          }
        }
      }
    } catch {
      setRecommendation(t("errorMessage"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("formTitle")}
          </CardTitle>
          <CardDescription>{t("formDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("budget")}</Label>
              <Input
                type="number"
                placeholder="e.g. 15000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("usage")}</Label>
              <Select value={usage} onValueChange={setUsage}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectUsage")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commuting">{t("usageCommuting")}</SelectItem>
                  <SelectItem value="sport">{t("usageSport")}</SelectItem>
                  <SelectItem value="touring">{t("usageTouring")}</SelectItem>
                  <SelectItem value="mixed">{t("usageMixed")}</SelectItem>
                  <SelectItem value="weekend">{t("usageWeekend")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("licenseClass")}</Label>
              <Select value={licenseClass} onValueChange={setLicenseClass}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectClass")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLASS_2B">Class 2B (≤200cc)</SelectItem>
                  <SelectItem value="CLASS_2A">Class 2A (≤400cc)</SelectItem>
                  <SelectItem value="CLASS_2">Class 2 (No limit)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("experience")}</Label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectExperience")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">{t("expBeginner")}</SelectItem>
                  <SelectItem value="intermediate">{t("expIntermediate")}</SelectItem>
                  <SelectItem value="advanced">{t("expAdvanced")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleRecommend}
            disabled={isLoading || !budget || !usage || !licenseClass}
            className="w-full mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("generating")}
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                {t("getRecommendations")}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {recommendation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("resultsTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {recommendation}
              </ReactMarkdown>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground mt-4">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs">{t("generating")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
