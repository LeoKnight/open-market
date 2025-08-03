"use client";

import { useState, useCallback } from "react";
import {
  calculateMotorcycleCost,
  calculateAnnualRunningCosts,
} from "@/utils/motorcycle-cost";
import { CostResults, RunningCosts } from "@/types/motorcycle";
import PurchaseCostDisplay from "@/components/PurchaseCostDisplay";
import MotorcycleForm from "@/components/MotorcycleForm";
import COEPriceDisplay from "@/components/COEPriceDisplay";
// import RunningCostsDisplay from "@/components/RunningCostsDisplay";

export default function MotorcycleCostCalculator() {
  const [results, setResults] = useState<CostResults | null>(null);
  const [runningCosts, setRunningCosts] = useState<RunningCosts | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [coePrice, setCoePrice] = useState<number | null>(null);

  // Handle COE price updates from the component
  const handleCOEPriceUpdate = useCallback((price: number) => {
    setCoePrice(price);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    (values: { omv: string; engineSize: string }) => {
      if (!coePrice) {
        alert(
          "COE price is not available. Please wait for it to load or refresh."
        );
        return;
      }

      setCalculating(true);

      try {
        const omv = parseFloat(values.omv);
        const engineSize = parseFloat(values.engineSize);

        // Calculate costs (now includes COE)
        const costResults = calculateMotorcycleCost(omv, coePrice);
        const annualCosts = calculateAnnualRunningCosts(engineSize);

        setResults(costResults);
        setRunningCosts(annualCosts);
      } catch (error) {
        console.error("Calculation error:", error);
        alert("Error calculating costs. Please check your inputs.");
      } finally {
        setCalculating(false);
      }
    },
    [coePrice]
  );

  const resetCalculator = useCallback(() => {
    setResults(null);
    setRunningCosts(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Motorcycle Cost Calculator
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 px-4">
            Calculate the total cost of purchasing a motorcycle in Singapore
          </p>
        </div>

        {/* COE Price Display */}
        <COEPriceDisplay
          onPriceUpdate={handleCOEPriceUpdate}
          className="mb-6 sm:mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Input Form */}
          <MotorcycleForm
            onSubmit={handleSubmit}
            onReset={resetCalculator}
            calculating={calculating}
          />

          {/* Purchase Cost Results - spans 2 columns when RunningCosts is hidden */}
          <div className="lg:col-span-2">
            <PurchaseCostDisplay results={results} />
          </div>

          {/* Running Costs */}
          {/* <RunningCostsDisplay runningCosts={runningCosts} /> */}
        </div>

        {/* Information Section */}
        <div className="mt-8 sm:mt-12 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Understanding Motorcycle Costs in Singapore
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                Purchase Costs
              </h4>
              <ul className="text-gray-600 text-xs sm:text-sm space-y-1">
                <li>
                  • <strong>OMV:</strong> Open Market Value - includes purchase
                  price, freight, insurance, handling and all other incidental
                  charges
                </li>
                <li>
                  • <strong>COE:</strong> Certificate of Entitlement - mandatory
                  for vehicle registration in Singapore
                </li>
                <li>
                  • <strong>ARF:</strong> Additional Registration Fee - tiered
                  rates of 15%, 50%, and 100% based on OMV brackets
                </li>
                <li>
                  • <strong>Excise Duty:</strong> 12% levy on the OMV as
                  determined by Singapore Customs
                </li>
                <li>
                  • <strong>GST:</strong> 9% Goods & Services Tax on OMV +
                  Excise Duty (excludes ARF)
                </li>
                <li>
                  • <strong>Registration Fee:</strong> One-time fee to register
                  the motorcycle with LTA
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                Ongoing Costs
              </h4>
              <ul className="text-gray-600 text-xs sm:text-sm space-y-1">
                <li>
                  • <strong>Road Tax:</strong> Annual fee based on engine size
                </li>
                <li>
                  • <strong>Insurance:</strong> Mandatory third-party and
                  optional comprehensive
                </li>
                <li>
                  • <strong>Maintenance:</strong> Regular servicing, repairs,
                  and consumables
                </li>
                <li>
                  • <strong>Fuel:</strong> Not included - varies by usage
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h5 className="font-semibold text-green-900 mb-2 text-sm">
              GST Calculation
            </h5>
            <p className="text-green-800 text-xs sm:text-sm">
              GST is calculated at 9% on the total of OMV + Excise Duty only.
              ARF is <strong>excluded</strong> from the GST calculation base as
              it is a separate registration fee.
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2 text-sm">
              ARF Rate Structure
            </h5>
            <div className="text-blue-800 text-xs sm:text-sm">
              <p className="mb-2">
                Additional Registration Fee (ARF) is calculated using tiered
                rates:
              </p>
              <ul className="space-y-1">
                <li>
                  • First S$5,000: <strong>15%</strong>
                </li>
                <li>
                  • Next S$5,000 (S$5,001 to S$10,000): <strong>50%</strong>
                </li>
                <li>
                  • Above S$10,000: <strong>100%</strong>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2 text-sm">
              Important Note - Singapore Customs Assessment
            </h5>
            <p className="text-blue-800 text-xs sm:text-sm">
              The Singapore Customs determines the OMV by taking into account
              the purchase price, freight, insurance, handling and all other
              incidental charges to the sale and delivery of the
              motorcycle/scooter in Singapore. Additional documents may be
              required for assessment purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
