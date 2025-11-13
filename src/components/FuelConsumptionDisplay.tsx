"use client";

import { FuelConsumptionResults } from "@/utils/fuel-conversion";

interface FuelConsumptionDisplayProps {
  results: FuelConsumptionResults | null;
}

export default function FuelConsumptionDisplay({
  results,
}: FuelConsumptionDisplayProps) {
  if (!results) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Conversion Results</h2>
        <div className="text-center py-12 text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg">Enter a fuel consumption value on the left</p>
          <p className="text-sm mt-2">Enter any unit value to automatically convert to other units</p>
        </div>
      </div>
    );
  }

  const resultItems = [
    {
      label: "Miles Per Gallon",
      value: results.mpg.toFixed(2),
      unit: "MPG",
      description: "Common fuel efficiency unit in the United States",
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      label: "Kilometers Per Liter",
      value: results.kmPerLiter.toFixed(2),
      unit: "km/L",
      description: "Common fuel efficiency unit in Asian regions",
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
    },
    {
      label: "Liters Per 100 Kilometers",
      value: results.litersPer100Km.toFixed(2),
      unit: "L/100km",
      description: "Common fuel consumption unit in Europe",
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Conversion Results</h2>

      <div className="space-y-4">
        {resultItems.map((item, index) => (
          <div
            key={index}
            className={`border-2 ${item.color} rounded-lg p-6 transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {item.label}
              </h3>
              <div className={`${item.iconColor}`}>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-gray-900">
                {item.value}
              </span>
              <span className="text-xl font-medium text-gray-600">
                {item.unit}
              </span>
            </div>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="font-semibold text-yellow-900 text-sm mb-1">
              About Fuel Efficiency Units
            </h4>
            <p className="text-sm text-yellow-800">
              Higher MPG and km/L values indicate better fuel efficiency, while lower L/100km values indicate better fuel efficiency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

