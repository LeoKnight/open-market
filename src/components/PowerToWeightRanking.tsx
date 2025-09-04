"use client";

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

export default function PowerToWeightRanking({
  motorcycles,
  onClear,
}: PowerToWeightRankingProps) {
  // Get performance category for styling
  const getPerformanceCategory = (ratio: number) => {
    if (ratio >= 1.2)
      return {
        level: "Superbike",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    if (ratio >= 0.8)
      return {
        level: "High Performance",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      };
    if (ratio >= 0.5)
      return {
        level: "Mid Performance",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      };
    return {
      level: "Entry Level",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    };
  };

  // Get ranking medal/trophy icon
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <span className="text-yellow-500 text-lg">🏆</span>;
      case 1:
        return <span className="text-gray-400 text-lg">🥈</span>;
      case 2:
        return <span className="text-amber-600 text-lg">🥉</span>;
      default:
        return (
          <span className="text-gray-400 font-bold text-sm">#{index + 1}</span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Power-to-Weight Rankings
        </h2>
        {motorcycles.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-red-600 hover:text-red-700 px-3 py-1 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {motorcycles.length === 0 ? (
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-gray-500">No motorcycle data yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Calculate power-to-weight ratios to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {motorcycles.map((motorcycle, index) => {
            const category = getPerformanceCategory(
              motorcycle.powerToWeightRatio
            );

            return (
              <div
                key={motorcycle.id}
                className={`border rounded-lg p-4 ${category.borderColor} ${category.bgColor} transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">{getRankIcon(index)}</div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {motorcycle.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>{motorcycle.weight}kg</span>
                        <span>{motorcycle.power}HP</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {motorcycle.powerToWeightRatio.toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-500">HP/kg</div>
                  </div>
                </div>

                <div className="mt-2 flex justify-between items-center">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${category.color} bg-white`}
                  >
                    {category.level}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(motorcycle.timestamp).toLocaleDateString("en-US")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {motorcycles.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2 text-sm">
            Statistics
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <div className="font-medium">
                Total Count: {motorcycles.length}
              </div>
              <div>
                Highest Ratio:{" "}
                {Math.max(
                  ...motorcycles.map((m) => m.powerToWeightRatio)
                ).toFixed(3)}
              </div>
            </div>
            <div>
              <div className="font-medium">
                Average Ratio:{" "}
                {(
                  motorcycles.reduce(
                    (sum, m) => sum + m.powerToWeightRatio,
                    0
                  ) / motorcycles.length
                ).toFixed(3)}
              </div>
              <div>
                Lowest Ratio:{" "}
                {Math.min(
                  ...motorcycles.map((m) => m.powerToWeightRatio)
                ).toFixed(3)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
