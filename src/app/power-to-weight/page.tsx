"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import PowerToWeightForm from "@/components/PowerToWeightForm";
import PowerToWeightDisplay from "@/components/PowerToWeightDisplay";
import PowerToWeightRanking from "@/components/PowerToWeightRanking";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PowerToWeightData {
  id: string;
  name: string;
  weight: number;
  power: number;
  powerToWeightRatio: number;
  timestamp: number;
}

export default function PowerToWeightCalculator() {
  const t = useTranslations("PowerToWeight");
  const [currentResult, setCurrentResult] = useState<PowerToWeightData | null>(
    null
  );
  const [motorcycleData, setMotorcycleData] = useState<PowerToWeightData[]>([]);
  const [calculating, setCalculating] = useState(false);

  // Generate automatic motorcycle name
  const generateMotorcycleName = (
    power: number,
    weight: number,
    ratio: number
  ) => {
    const performanceLevel =
      ratio >= 1.2
        ? "Superbike"
        : ratio >= 0.8
        ? "Sport"
        : ratio >= 0.5
        ? "Standard"
        : "Cruiser";
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${performanceLevel} ${power}HP/${weight}kg (${timestamp})`;
  };

  // Handle form submission
  const handleSubmit = useCallback(
    (values: { weight: string; power: string }) => {
      setCalculating(true);

      try {
        const weight = parseFloat(values.weight);
        const power = parseFloat(values.power);

        // Calculate power-to-weight ratio (HP per kg)
        const powerToWeightRatio = power / weight;

        // Generate automatic name
        const name = generateMotorcycleName(power, weight, powerToWeightRatio);

        const newData: PowerToWeightData = {
          id: Date.now().toString(),
          name,
          weight,
          power,
          powerToWeightRatio,
          timestamp: Date.now(),
        };

        setCurrentResult(newData);

        // Add to ranking list
        setMotorcycleData((prev) => {
          const updated = [...prev, newData];
          // Sort by power-to-weight ratio (highest first)
          return updated.sort(
            (a, b) => b.powerToWeightRatio - a.powerToWeightRatio
          );
        });
      } catch (error) {
        console.error("Calculation error:", error);
        alert(t("calcError"));
      } finally {
        setCalculating(false);
      }
    },
    []
  );

  const resetCalculator = useCallback(() => {
    setCurrentResult(null);
  }, []);

  const clearRanking = useCallback(() => {
    setMotorcycleData([]);
    setCurrentResult(null);
  }, []);

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Motorcycle Power-to-Weight Ratio Calculator
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground px-4">
            Calculate motorcycle power-to-weight ratio and view rankings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Input Form */}
          <PowerToWeightForm
            onSubmit={handleSubmit}
            onReset={resetCalculator}
            calculating={calculating}
          />

          {/* Current Result Display */}
          <div className="lg:col-span-1">
            <PowerToWeightDisplay result={currentResult} />
          </div>

          {/* Ranking Display */}
          <div className="lg:col-span-1">
            <PowerToWeightRanking
              motorcycles={motorcycleData}
              onClear={clearRanking}
            />
          </div>
        </div>

        {/* Information Section */}
        <Card className="mt-8 sm:mt-12">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              {t("aboutTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">
                  {t("whatIs")}
                </h4>
                <ul className="text-muted-foreground text-xs sm:text-sm space-y-1">
                  <li>• {t("whatIsDesc1")}</li>
                  <li>• {t("whatIsDesc2")}</li>
                  <li>• {t("whatIsDesc3")}</li>
                  <li>• {t("whatIsDesc4")}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">
                  {t("referenceStandards")}
                </h4>
                <ul className="text-muted-foreground text-xs sm:text-sm space-y-1">
                  <li>• {t("entryLevel")}</li>
                  <li>• {t("midPerformance")}</li>
                  <li>• {t("highPerformance")}</li>
                  <li>• {t("superbikeLevel")}</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
                {t("formulaTitle")}
              </h5>
              <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm">
                {t("formula")}
              </p>
              <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm mt-1">
                {t("formulaExample")}
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2 text-sm">
                {t("importantNotes")}
              </h5>
              <ul className="text-green-800 dark:text-green-200 text-xs sm:text-sm space-y-1">
                <li>• {t("note1")}</li>
                <li>• {t("note2")}</li>
                <li>• {t("note3")}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
