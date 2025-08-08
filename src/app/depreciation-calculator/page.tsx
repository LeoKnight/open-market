"use client";

import { useState, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import COEPriceDisplay from "@/components/COEPriceDisplay";

interface CalculationResults {
  newPrice: number;
  currentPrice: number;
  totalDepreciation: number;
  depreciationRate: number;
  annualDepreciationRate: number;
  valueRetention: number;
  yearsSinceReg: number;
  daysSinceReg: number;
  coeRemainingValue: number;
  coeRemainingYears: number;
  coeRemainingDays: number;
  currentCoePrice: number;
  newPriceExcludeCoe: number; // 新车去除COE的价格
  currentPriceExcludeCoe: number; // 旧车去除COE的价格
}

// Formik Field Component
const FormikField = memo(
  ({
    label,
    name,
    placeholder,
    type = "text",
  }: {
    label: string;
    name: string;
    placeholder?: string;
    type?: string;
  }) => (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <Field
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <ErrorMessage
        name={name}
        component="div"
        className="mt-1 text-sm text-red-600"
      />
    </div>
  )
);

FormikField.displayName = "FormikField";

// Validation Schema
const validationSchema = Yup.object()
  .shape({
    newCarPrice: Yup.number()
      .required("New price is required")
      .positive("Price must be positive")
      .min(1000, "Price must be at least S$1,000")
      .max(1000000, "Price must be less than S$1,000,000"),
    currentPrice: Yup.number()
      .required("Current price is required")
      .positive("Price must be positive")
      .min(100, "Price must be at least S$100")
      .max(1000000, "Price must be less than S$1,000,000"),
    registrationDate: Yup.date()
      .required("Registration date is required")
      .max(new Date(), "Registration date cannot be in the future")
      .min(new Date("2000-01-01"), "Registration date must be after 2000"),
  })
  .test(
    "currentPrice",
    "Current price must be less than new price",
    function (values) {
      const { newCarPrice, currentPrice } = values;
      if (newCarPrice && currentPrice && currentPrice >= newCarPrice) {
        return this.createError({
          path: "currentPrice",
          message: "Current price must be less than new price",
        });
      }
      return true;
    }
  );

export default function DepreciationCalculator() {
  const [coePrice, setCoePrice] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState<CalculationResults | null>(null);

  // Initial form values
  const initialValues = {
    newCarPrice: "",
    currentPrice: "",
    registrationDate: "",
  };

  // Handle COE price updates from the component
  const handleCOEPriceUpdate = useCallback((price: number) => {
    setCoePrice(price);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    (values: typeof initialValues) => {
      if (!coePrice) {
        alert("COE price is not available. Please try again.");
        return;
      }

      setCalculating(true);

      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        const newPrice = parseFloat(values.newCarPrice);
        const currentPrice = parseFloat(values.currentPrice);
        const regDate = new Date(values.registrationDate);
        const currentDate = new Date();

        // Calculate days since registration
        const daysSinceReg = Math.floor(
          (currentDate.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Calculate years for display purposes
        const yearsSinceReg = daysSinceReg / 365;

        // COE is valid for 10 years (3652.5 days), after which it depreciates to 0
        const totalCoeDays = 10 * 365; // 3652.5 days
        const coeRemainingDays = Math.max(
          0,
          totalCoeDays - (daysSinceReg % (365 * 10))
        );
        const coeRemainingYears = coeRemainingDays / 365;
        const coeRemainingValue = (coeRemainingDays / totalCoeDays) * coePrice;

        // Calculate value retention (新车价格刨除COE价值 - 旧车刨除COE价值)
        const newPriceExcludeCoe = newPrice - coePrice;
        const currentPriceExcludeCoe = currentPrice - coeRemainingValue;
        const valueRetention =
          (currentPriceExcludeCoe / newPriceExcludeCoe) * 100;

        // Calculate depreciation
        const totalDepreciation = newPriceExcludeCoe - currentPriceExcludeCoe;
        const depreciationRate = (totalDepreciation / newPriceExcludeCoe) * 100;
        const annualDepreciationRate = depreciationRate / yearsSinceReg;

        setResults({
          newPrice,
          currentPrice,
          totalDepreciation,
          depreciationRate,
          annualDepreciationRate,
          valueRetention,
          yearsSinceReg,
          daysSinceReg,
          coeRemainingValue,
          coeRemainingYears,
          coeRemainingDays,
          currentCoePrice: coePrice,
          newPriceExcludeCoe, // 新车去除COE的价格
          currentPriceExcludeCoe, // 旧车去除COE的价格
        });

        setCalculating(false);
      });
    },
    [coePrice]
  );

  const resetCalculator = useCallback(() => {
    setResults(null);
  }, []);

  // Memoize button disabled state
  const isCalculateDisabled = useMemo(() => {
    return calculating;
  }, [calculating]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Motorcycle Depreciation Calculator
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 px-4">
            Calculate your motorcycle&apos;s depreciation rate with real-time
            COE prices from LTA Singapore
          </p>
        </div>

        {/* COE Price Display */}
        <COEPriceDisplay
          onPriceUpdate={handleCOEPriceUpdate}
          className="mb-6 sm:mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Vehicle Information
            </h2>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isValid, dirty, resetForm }) => (
                <Form className="space-y-4 sm:space-y-6">
                  <FormikField
                    label="New Price (S$)"
                    name="newCarPrice"
                    placeholder="e.g., 25000"
                    type="number"
                  />

                  <FormikField
                    label="Current Market Price (S$)"
                    name="currentPrice"
                    placeholder="e.g., 18000"
                    type="number"
                  />

                  <FormikField
                    label="Registration Date"
                    name="registrationDate"
                    type="date"
                  />

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      type="submit"
                      disabled={isCalculateDisabled || !isValid || !dirty}
                      className="flex-1 bg-blue-600 text-white py-4 sm:py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-base transition-colors"
                    >
                      {calculating
                        ? "Calculating..."
                        : "Calculate Depreciation"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        resetCalculator();
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-4 sm:py-3 px-4 rounded-md font-medium hover:bg-gray-300 text-base transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Calculation Results
            </h2>

            {!results ? (
              <div className="text-center text-gray-500 py-8 sm:py-12">
                <svg
                  className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4"
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
                <p className="text-sm sm:text-base px-4">
                  Enter vehicle information to see depreciation calculations
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-red-600 font-medium">
                      Total Depreciation
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-red-700">
                      S${Math.round(results.totalDepreciation).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-xs sm:text-sm text-green-600 font-medium">
                      Machine Value Retention
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-green-700">
                      {results.valueRetention.toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-gray-600">
                        Depreciation Rate:
                      </span>
                      <span className="font-semibold text-sm sm:text-base">
                        {results.depreciationRate.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-gray-600">
                        Annual Depreciation Rate:
                      </span>
                      <div className="text-right">
                        <span className="font-semibold text-sm sm:text-base block">
                          {results.annualDepreciationRate.toFixed(2)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          (per year)
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-gray-600">
                        Days Since Registration:
                      </span>
                      <div className="text-right">
                        <span className="font-semibold text-sm sm:text-base block">
                          {results.daysSinceReg.toLocaleString()} days
                        </span>
                        <span className="text-xs text-gray-500">
                          {`
                            ${Math.floor(results.yearsSinceReg)} year
                            ${Math.floor(
                              (results.yearsSinceReg -
                                Math.floor(results.yearsSinceReg)) *
                                12
                            )}
                            months ${Math.floor(results.daysSinceReg % 30.4375)}
                            days
                            `}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="text-sm sm:text-base text-gray-600">
                        New Price Excluding COE:
                      </span>
                      <span className="font-semibold text-sm sm:text-base">
                        S$
                        {Math.round(
                          results.newPriceExcludeCoe
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-gray-600">
                        Current Price Excluding COE:
                      </span>
                      <span className="font-semibold text-sm sm:text-base">
                        S$
                        {Math.round(
                          results.currentPriceExcludeCoe
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="text-sm sm:text-base text-gray-600">
                        COE Remaining Value:
                      </span>
                      <span className="font-semibold text-sm sm:text-base">
                        S$
                        {Math.round(results.coeRemainingValue).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-gray-600">
                        COE Remaining Days:
                      </span>
                      <div className="text-right">
                        <span className="font-semibold text-sm sm:text-base block">
                          {Math.round(
                            results.coeRemainingDays
                          ).toLocaleString()}{" "}
                          days
                        </span>
                        <span className="text-xs text-gray-500">
                          {`
                            ${Math.floor(results.coeRemainingYears)} years
                            ${Math.floor(
                              (results.coeRemainingYears -
                                Math.floor(results.coeRemainingYears)) *
                                12
                            )}
                            months ${Math.floor(
                              (results.coeRemainingYears -
                                Math.floor(results.coeRemainingYears)) *
                                12
                            )}
                            days
                            `}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg mt-4 sm:mt-6">
                  <p className="text-xs sm:text-sm text-yellow-800">
                    <strong>Note:</strong> All time periods are displayed in
                    days for maximum precision. COE values depreciate linearly
                    over 3,652.5 days (10 years). Current calculation uses the
                    latest COE price of S$
                    {results.currentCoePrice?.toLocaleString()}
                    for motorcycles from LTA Singapore.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-8 sm:mt-12 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            How Motorcycle Depreciation Works in Singapore
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                COE (Certificate of Entitlement)
              </h4>
              <p className="text-gray-600 text-xs sm:text-sm">
                COE is required to own a vehicle in Singapore and is valid for
                3,652.5 days (10 years). The calculator displays all time
                periods in days for maximum precision and accurate daily
                depreciation tracking.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                Depreciation Calculation
              </h4>
              <p className="text-gray-600 text-xs sm:text-sm">
                This calculator considers both the vehicle&apos;s market
                depreciation and the remaining COE value based on daily
                depreciation calculations using current LTA prices to give you a
                precise assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
