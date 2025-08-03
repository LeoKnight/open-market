import { RunningCosts } from "@/types/motorcycle";

interface RunningCostsDisplayProps {
  runningCosts: RunningCosts | null;
}

export default function RunningCostsDisplay({
  runningCosts,
}: RunningCostsDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Estimated Annual Costs
      </h2>

      {!runningCosts ? (
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
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Calculate costs to see annual expenses</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Total Annual Cost */}
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-green-600 font-medium mb-1">
              Total Annual Running Cost
            </p>
            <p className="text-2xl font-bold text-green-700">
              S${runningCosts.total.toLocaleString()}
            </p>
          </div>

          {/* Running Cost Breakdown */}
          <div className="space-y-3">
            {Object.entries(runningCosts.breakdown).map(([key, item]) => (
              <div
                key={key}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <p className="text-sm font-medium text-gray-900">
                  {item.label}
                </p>
                <p className="text-sm font-semibold">
                  S${item.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-500 mt-4 p-3 bg-yellow-50 rounded">
            <strong>Note:</strong> Annual costs are estimates and may vary based
            on usage, insurance provider, and maintenance needs.
          </div>
        </div>
      )}
    </div>
  );
}
