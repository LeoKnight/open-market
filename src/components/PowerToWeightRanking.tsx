"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface PowerToWeightData {
  id: string;
  name: string;
  weight: number;
  power: number;
  powerToWeightRatio: number;
  timestamp: number;
}

interface PowerToWeightRankingProps {
  motorcycles: PowerToWeightData[];
  onClear: () => void;
}

export default function PowerToWeightRanking({ motorcycles, onClear }: PowerToWeightRankingProps) {
  const getPerformanceCategory = (ratio: number) => {
    if (ratio >= 1.2) return { level: "Superbike", variant: "destructive" as const };
    if (ratio >= 0.8) return { level: "High Performance", variant: "default" as const };
    if (ratio >= 0.5) return { level: "Mid Performance", variant: "secondary" as const };
    return { level: "Entry Level", variant: "outline" as const };
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <span className="text-yellow-500 text-lg">🏆</span>;
      case 1: return <span className="text-gray-400 text-lg">🥈</span>;
      case 2: return <span className="text-amber-600 text-lg">🥉</span>;
      default: return <span className="text-muted-foreground font-bold text-sm">#{index + 1}</span>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Power-to-Weight Rankings</CardTitle>
        {motorcycles.length > 0 && (
          <Button variant="destructive" size="sm" onClick={onClear}>Clear</Button>
        )}
      </CardHeader>
      <CardContent>
        {motorcycles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="mx-auto h-12 w-12 mb-4 opacity-40" />
            <p>No motorcycle data yet</p>
            <p className="text-sm mt-1">Calculate power-to-weight ratios to see them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {motorcycles.map((motorcycle, index) => {
              const category = getPerformanceCategory(motorcycle.powerToWeightRatio);
              return (
                <div key={motorcycle.id} className="border rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">{getRankIcon(index)}</div>
                      <div className="flex-grow min-w-0">
                        <h3 className="font-semibold truncate">{motorcycle.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span>{motorcycle.weight}kg</span>
                          <span>{motorcycle.power}HP</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-lg font-bold">{motorcycle.powerToWeightRatio.toFixed(3)}</div>
                      <div className="text-xs text-muted-foreground">HP/kg</div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <Badge variant={category.variant}>{category.level}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(motorcycle.timestamp).toLocaleDateString("en-US")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {motorcycles.length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <div className="font-medium">Total Count: {motorcycles.length}</div>
                <div>Highest Ratio: {Math.max(...motorcycles.map((m) => m.powerToWeightRatio)).toFixed(3)}</div>
              </div>
              <div>
                <div className="font-medium">Average Ratio: {(motorcycles.reduce((sum, m) => sum + m.powerToWeightRatio, 0) / motorcycles.length).toFixed(3)}</div>
                <div>Lowest Ratio: {Math.min(...motorcycles.map((m) => m.powerToWeightRatio)).toFixed(3)}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
