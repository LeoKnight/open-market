"use client";

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

export default function PowerToWeightDisplay({
  result,
}: PowerToWeightDisplayProps) {
  if (!result) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          Calculation Results
        </h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-gray-500">
            Enter motorcycle information to view power-to-weight ratio
            calculation results
          </p>
        </div>
      </div>
    );
  }

  // Determine performance category
  const getPerformanceCategory = (ratio: number) => {
    if (ratio >= 1.2)
      return {
        level: "Superbike",
        color: "text-red-600",
        bgColor: "bg-red-50",
      };
    if (ratio >= 0.8)
      return {
        level: "High Performance",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      };
    if (ratio >= 0.5)
      return {
        level: "Mid Performance",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      };
    return {
      level: "Entry Level",
      color: "text-green-600",
      bgColor: "bg-green-50",
    };
  };

  const category = getPerformanceCategory(result.powerToWeightRatio);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Calculation Results
      </h2>

      {/* Motorcycle Name */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {result.name}
        </h3>
        <div className="text-sm text-gray-500">
          Calculated: {new Date(result.timestamp).toLocaleString("en-US")}
        </div>
      </div>

      {/* Main Result */}
      <div className={`rounded-lg p-4 mb-6 ${category.bgColor}`}>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {result.powerToWeightRatio.toFixed(3)}
          </div>
          <div className="text-sm text-gray-600 mb-2">HP/kg</div>
          <div
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${category.color} bg-white`}
          >
            {category.level}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-4">
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Detailed Parameters
          </h4>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Vehicle Weight</span>
              <span className="font-medium">{result.weight} kg</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Engine Power</span>
              <span className="font-medium">{result.power} HP</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Power-to-Weight Ratio</span>
              <span className="font-medium text-blue-600">
                {result.powerToWeightRatio.toFixed(3)} HP/kg
              </span>
            </div>
          </div>
        </div>

        {/* Performance Comparison */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Performance Comparison
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">vs Entry Level (0.3-0.5):</span>
              <span
                className={
                  result.powerToWeightRatio > 0.5
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                {result.powerToWeightRatio > 0.5 ? "Stronger" : "Similar"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                vs Mid Performance (0.5-0.8):
              </span>
              <span
                className={
                  result.powerToWeightRatio > 0.8
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                {result.powerToWeightRatio > 0.8
                  ? "Stronger"
                  : result.powerToWeightRatio >= 0.5
                  ? "Similar"
                  : "Weaker"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                vs High Performance (0.8-1.2):
              </span>
              <span
                className={
                  result.powerToWeightRatio > 1.2
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                {result.powerToWeightRatio > 1.2
                  ? "Stronger"
                  : result.powerToWeightRatio >= 0.8
                  ? "Similar"
                  : "Weaker"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
