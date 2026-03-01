"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Scale } from "lucide-react";
import RegulationQA from "@/components/RegulationQA";

export default function RegulationsPage() {
  const t = useTranslations("Regulations");

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Scale className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t("title")}
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <RegulationQA />
      </div>
    </div>
  );
}
