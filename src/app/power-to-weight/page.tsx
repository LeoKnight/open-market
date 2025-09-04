"use client";

import { useState, useCallback } from "react";
import PowerToWeightForm from "@/components/PowerToWeightForm";
import PowerToWeightDisplay from "@/components/PowerToWeightDisplay";
import PowerToWeightRanking from "@/components/PowerToWeightRanking";

interface PowerToWeightData {
  id: string;
  name: string;
  weight: number;
  power: number;
  powerToWeightRatio: number;
  timestamp: number;
}

export default function PowerToWeightCalculator() {
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
        alert("Calculation error. Please check your input data.");
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
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Motorcycle Power-to-Weight Ratio Calculator
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 px-4">
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
        <div className="mt-8 sm:mt-12 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            About Motorcycle Power-to-Weight Ratio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                What is Power-to-Weight Ratio?
              </h4>
              <ul className="text-gray-600 text-xs sm:text-sm space-y-1">
                <li>
                  • <strong>Power-to-Weight Ratio</strong> is the ratio of
                  engine power to vehicle weight
                </li>
                <li>• Usually measured in horsepower per kilogram (HP/kg)</li>
                <li>
                  • Higher power-to-weight ratio typically means better
                  acceleration performance
                </li>
                <li>
                  • One of the important indicators for measuring motorcycle
                  performance
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                Power-to-Weight Ratio Reference Standards
              </h4>
              <ul className="text-gray-600 text-xs sm:text-sm space-y-1">
                <li>
                  • <strong>0.3-0.5 HP/kg:</strong> Entry-level motorcycles
                </li>
                <li>
                  • <strong>0.5-0.8 HP/kg:</strong> Mid-performance motorcycles
                </li>
                <li>
                  • <strong>0.8-1.2 HP/kg:</strong> High-performance motorcycles
                </li>
                <li>
                  • <strong>1.2+ HP/kg:</strong> Superbike level
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2 text-sm">
              Calculation Formula
            </h5>
            <p className="text-blue-800 text-xs sm:text-sm">
              Power-to-Weight Ratio = Engine Power (HP) ÷ Vehicle Weight (kg)
            </p>
            <p className="text-blue-800 text-xs sm:text-sm mt-1">
              Example: A 150HP motorcycle weighing 200kg has a ratio = 150 ÷ 200
              = 0.75 HP/kg
            </p>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h5 className="font-semibold text-green-900 mb-2 text-sm">
              Important Notes
            </h5>
            <ul className="text-green-800 text-xs sm:text-sm space-y-1">
              <li>• Vehicle weight should include fuel and necessary fluids</li>
              <li>
                • Please refer to manufacturer&apos;s official specifications
                for power data
              </li>
              <li>
                • Power-to-weight ratio is just one performance indicator;
                actual riding experience is affected by other factors
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
