"use client";

import { useTranslations } from "next-intl";
import { Zap, Weight, RotateCw, Fuel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PerformanceCardProps {
  power?: number | null;
  weight?: number | null;
  torque?: number | null;
  fuelConsumption?: number | null;
  engineSize: number;
}

function getPerformanceLevel(ratio: number) {
  if (ratio >= 1.2) return { level: "Superbike", variant: "destructive" as const, pct: 100 };
  if (ratio >= 0.8) return { level: "Sport", variant: "default" as const, pct: 75 };
  if (ratio >= 0.5) return { level: "Standard", variant: "secondary" as const, pct: 50 };
  if (ratio >= 0.3) return { level: "Entry", variant: "outline" as const, pct: 30 };
  return { level: "Cruiser", variant: "outline" as const, pct: 15 };
}

const FUEL_PRICE_SGD = 3.0;

export default function PerformanceCard({
  power, weight, torque, fuelConsumption, engineSize,
}: PerformanceCardProps) {
  const t = useTranslations("Performance");

  if (!power && !weight && !torque && !fuelConsumption) return null;

  const ratio = power && weight ? power / weight : null;
  const perfLevel = ratio ? getPerformanceLevel(ratio) : null;
  const monthlyFuelCost = fuelConsumption ? Math.round((fuelConsumption / 100) * 500 * FUEL_PRICE_SGD) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {perfLevel && ratio && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant={perfLevel.variant}>{perfLevel.level}</Badge>
              <span className="text-sm font-bold">{ratio.toFixed(3)} HP/kg</span>
            </div>
            <Progress value={Math.min(100, (ratio / 1.5) * 100)} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0</span><span>0.5</span><span>1.0</span><span>1.5+</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {power && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Zap className="h-3.5 w-3.5" /><span className="text-xs">{t("power")}</span>
              </div>
              <p className="text-sm font-bold">{power} HP</p>
            </div>
          )}
          {weight && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Weight className="h-3.5 w-3.5" /><span className="text-xs">{t("weight")}</span>
              </div>
              <p className="text-sm font-bold">{weight} kg</p>
            </div>
          )}
          {torque && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <RotateCw className="h-3.5 w-3.5" /><span className="text-xs">{t("torque")}</span>
              </div>
              <p className="text-sm font-bold">{torque} Nm</p>
            </div>
          )}
          {fuelConsumption && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Fuel className="h-3.5 w-3.5" /><span className="text-xs">{t("fuelConsumption")}</span>
              </div>
              <p className="text-sm font-bold">{fuelConsumption} L/100km</p>
            </div>
          )}
        </div>

        {monthlyFuelCost && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 font-medium">{t("estimatedMonthlyFuel")}</p>
            <p className="text-lg font-bold text-green-700">~S${monthlyFuelCost}/{t("month")}</p>
            <p className="text-xs text-green-500">{t("basedOnKm")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
