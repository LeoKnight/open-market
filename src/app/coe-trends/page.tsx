"use client";

import React from "react";
import { useTranslations } from "next-intl";
import COEChart from "@/components/COEChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  motorcycleCOEHistory,
  getCOEStatistics,
} from "@/data/motorcycle-coe-data";

interface COEStatistics {
  count: number;
  min: number;
  max: number;
  average: number;
  latest: number;
  latestPqp: number | null;
  pqpMin: number | null;
  pqpMax: number | null;
}

export default function COETrendsPage() {
  const t = useTranslations("CoeTrends");
  const statistics = getCOEStatistics() as COEStatistics | null;

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground px-4 mb-6">
            {t("subtitle")}
          </p>

          {/* Quick Stats */}
          {/* {statistics && (
            <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    S${statistics.latest.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Latest Price</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    S${statistics.average.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Average Price</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    S${statistics.max.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Peak Price</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">
                    {statistics.count}
                  </p>
                  <p className="text-sm text-gray-600">Total Biddings</p>
                </div>
              </div>
            </div>
          )} */}
        </div>

        {/* Chart Component */}
        <COEChart data={motorcycleCOEHistory} />

        {/* Information Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("aboutCoeTitle")}</CardTitle>
              <CardDescription>
                {t("aboutCoeDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  {t("whatIsCoe")}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {t("whatIsCoeDesc")}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  {t("whatIsPqp")}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {t("whatIsPqpDesc")}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  {t("coeVsPqp")}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {t("coeVsPqpDesc")}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  {t("biddingProcess")}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {t("biddingProcessDesc")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("chartFeaturesTitle")}</CardTitle>
              <CardDescription>
                {t("chartFeaturesDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  {t("timeRanges")}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {t("timeRangesDesc")}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  {t("chartTypes")}
                </h4>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>
                    • {t("lineChartDesc")}
                  </li>
                  <li>
                    • {t("combinedChartDesc")}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  {t("pqpTrendLine")}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {t("pqpTrendLineDesc")}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  {t("tooltipData")}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {t("tooltipDataDesc")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Insights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t("marketInsightsTitle")}</CardTitle>
            <CardDescription>
              {t("marketInsightsDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  {t("cyclicalPatterns")}
                </h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  {t("cyclicalPatternsDesc")}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  {t("quotaImpact")}
                </h4>
                <p className="text-green-800 dark:text-green-200 text-sm">
                  {t("quotaImpactDesc")}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  {t("seasonalTrends")}
                </h4>
                <p className="text-purple-800 dark:text-purple-200 text-sm">
                  {t("seasonalTrendsDesc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
