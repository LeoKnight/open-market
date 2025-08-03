import { CostResults } from "@/types/motorcycle";

interface PurchaseCostDisplayProps {
  results: CostResults | null;
}

export default function PurchaseCostDisplay({
  results,
}: PurchaseCostDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Purchase Cost Breakdown
      </h2>

      {!results ? (
        <div className="text-center text-gray-500 py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
          <p className="text-sm">
            Enter motorcycle details to see cost breakdown
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Total Cost Display */}
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-blue-600 font-medium mb-1">
              Total Purchase Cost
            </p>
            <p className="text-3xl font-bold text-blue-700">
              S${results.totalCost.toLocaleString()}
            </p>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3">
            {Object.entries(results.breakdown).map(([key, item]) => (
              <div
                key={key}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.label}
                  </p>
                  {"note" in item && (
                    <p className="text-xs text-gray-500">{item.note}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    S${item.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
