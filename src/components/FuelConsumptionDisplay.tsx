"use client";

import { FuelConsumptionResults } from "@/utils/fuel-conversion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Calculator, Info } from "lucide-react";

interface FuelConsumptionDisplayProps {
  results: FuelConsumptionResults | null;
}

export default function FuelConsumptionDisplay({ results }: FuelConsumptionDisplayProps) {
  if (!results) {
    return (
      <Card>
        <CardHeader><CardTitle>Conversion Results</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calculator className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Enter a fuel consumption value on the left</p>
            <p className="text-sm mt-2">Enter any unit value to automatically convert to other units</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const resultItems = [
    { label: "Miles Per Gallon", value: results.mpg.toFixed(2), unit: "MPG", description: "Common fuel efficiency unit in the United States", color: "bg-blue-50 border-blue-200" },
    { label: "Kilometers Per Liter", value: results.kmPerLiter.toFixed(2), unit: "km/L", description: "Common fuel efficiency unit in Asian regions", color: "bg-green-50 border-green-200" },
    { label: "Liters Per 100 Kilometers", value: results.litersPer100Km.toFixed(2), unit: "L/100km", description: "Common fuel consumption unit in Europe", color: "bg-purple-50 border-purple-200" },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Conversion Results</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {resultItems.map((item, index) => (
          <div key={index} className={`border-2 ${item.color} rounded-lg p-6 transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{item.label}</h3>
              <Zap className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold">{item.value}</span>
              <span className="text-xl font-medium text-muted-foreground">{item.unit}</span>
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}

        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <span className="font-semibold">About Fuel Efficiency Units</span>
            <br />
            Higher MPG and km/L values indicate better fuel efficiency, while lower L/100km values indicate better fuel efficiency.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
