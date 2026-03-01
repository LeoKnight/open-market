"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart3 } from "lucide-react";

interface PowerToWeightData {
  id: string;
  name: string;
  weight: number;
  power: number;
  powerToWeightRatio: number;
  timestamp: number;
}

interface PowerToWeightDisplayProps {
  result: PowerToWeightData | null;
}

export default function PowerToWeightDisplay({ result }: PowerToWeightDisplayProps) {
  if (!result) {
    return (
      <Card>
        <CardHeader><CardTitle>Calculation Results</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-40" />
            <p>Enter motorcycle information to view power-to-weight ratio calculation results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceCategory = (ratio: number) => {
    if (ratio >= 1.2) return { level: "Superbike", variant: "destructive" as const };
    if (ratio >= 0.8) return { level: "High Performance", variant: "default" as const };
    if (ratio >= 0.5) return { level: "Mid Performance", variant: "secondary" as const };
    return { level: "Entry Level", variant: "outline" as const };
  };

  const category = getPerformanceCategory(result.powerToWeightRatio);

  return (
    <Card>
      <CardHeader><CardTitle>Calculation Results</CardTitle></CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{result.name}</h3>
          <p className="text-sm text-muted-foreground">
            Calculated: {new Date(result.timestamp).toLocaleString("en-US")}
          </p>
        </div>

        <div className="rounded-lg p-4 mb-6 bg-muted text-center">
          <div className="text-3xl font-bold mb-2">{result.powerToWeightRatio.toFixed(3)}</div>
          <div className="text-sm text-muted-foreground mb-2">HP/kg</div>
          <Badge variant={category.variant}>{category.level}</Badge>
        </div>

        <Separator className="mb-4" />

        <div className="space-y-4">
          <h4 className="font-semibold">Detailed Parameters</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Vehicle Weight</span>
              <span className="font-medium">{result.weight} kg</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Engine Power</span>
              <span className="font-medium">{result.power} HP</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Power-to-Weight Ratio</span>
              <span className="font-medium text-primary">{result.powerToWeightRatio.toFixed(3)} HP/kg</span>
            </div>
          </div>

          <Separator />

          <h4 className="font-semibold">Performance Comparison</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">vs Entry Level (0.3-0.5):</span>
              <span className={result.powerToWeightRatio > 0.5 ? "text-green-600" : "text-muted-foreground"}>
                {result.powerToWeightRatio > 0.5 ? "Stronger" : "Similar"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">vs Mid Performance (0.5-0.8):</span>
              <span className={result.powerToWeightRatio > 0.8 ? "text-green-600" : "text-muted-foreground"}>
                {result.powerToWeightRatio > 0.8 ? "Stronger" : result.powerToWeightRatio >= 0.5 ? "Similar" : "Weaker"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">vs High Performance (0.8-1.2):</span>
              <span className={result.powerToWeightRatio > 1.2 ? "text-green-600" : "text-muted-foreground"}>
                {result.powerToWeightRatio > 1.2 ? "Stronger" : result.powerToWeightRatio >= 0.8 ? "Similar" : "Weaker"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
